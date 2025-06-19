import type { GLTFLoaderPlugin, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WebIO, type GLTF } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { metalRough } from '@gltf-transform/functions';

class BinaryExtension {
  name: string;
  content: string | null = null;
  body: ArrayBuffer | null = null;
  header: { magic: string; version: number; length: number };

  constructor(data: ArrayBuffer) {
    this.name = 'KHR_binary_glTF';
    const BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
    const BINARY_EXTENSION_HEADER_LENGTH = 12;
    const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4e4f534a, BIN: 0x004e4942 } as const;
    const headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);
    const textDecoder = new TextDecoder();
    this.header = {
      magic: textDecoder.decode(new Uint8Array(data.slice(0, 4))),
      version: headerView.getUint32(4, true),
      length: headerView.getUint32(8, true),
    };
    if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
      throw new Error('Unsupported glTF-Binary header.');
    } else if (this.header.version < 2.0) {
      throw new Error('Legacy binary file detected.');
    }
    const chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH;
    const chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH);
    let chunkIndex = 0;
    while (chunkIndex < chunkContentsLength) {
      const chunkLength = chunkView.getUint32(chunkIndex, true);
      chunkIndex += 4;
      const chunkType = chunkView.getUint32(chunkIndex, true);
      chunkIndex += 4;
      if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
        const contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength);
        this.content = textDecoder.decode(contentArray);
      } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
        const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
        this.body = data.slice(byteOffset, byteOffset + chunkLength);
      }
      chunkIndex += chunkLength;
    }
    if (this.content === null) {
      throw new Error('JSON content not found.');
    }
  }
}

export const gltfKhrPbrSpecularGlossinessConverter =
  (confirm?: (s: string) => Promise<boolean>) =>
  (parser: GLTFParser): GLTFLoaderPlugin => ({
    name: 'KHR_materials_pbrSpecularGlossiness',
    beforeRoot: async () => {
      if (confirm && !(await confirm('Convert KHR_materials_pbrSpecularGlossiness to KHR_materials_pbrMetallicRoughness?')))
        return;
      const io = new WebIO().registerExtensions(ALL_EXTENSIONS);
      const document = await io.readJSON({
        json: parser.json as GLTF.IGLTF,
        resources: {
          '@glb.bin': new Uint8Array((parser.extensions.KHR_binary_glTF as { body?: ArrayBuffer } | undefined)?.body ?? new ArrayBuffer(0)),
        },
      });
      await document.transform(metalRough());
      const res = await io.writeBinary(document);
      const binaryExtension = new BinaryExtension(res.buffer as ArrayBuffer);
      (parser.extensions as Record<string, unknown>).KHR_binary_glTF = binaryExtension;
      parser.json = JSON.parse(binaryExtension.content!) as GLTF.IGLTF;
    },
  });
