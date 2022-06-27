import { create, CID, IPFS } from 'ipfs-core';
import { flatten } from "lodash";
import { concat as uint8ArrayConcat } from 'uint8arrays';

interface ToFile {
    path: string,
    content: Uint8Array
}

async function toFileObjs(files: FileList): Promise<ToFile[]> {
    return Promise.all(Array.from(files).map(toFileObj));
}

async function toFileObj(file: File): Promise<ToFile> {
    return {
        path: file.name,
        content: new Uint8Array(await file.arrayBuffer())
    };
}

async function addAll(client: IPFS, files: ToFile[]): Promise<CID[]> {
    const cids: CID[] = [];
    for await (const result of client.addAll(files, {
        cidVersion: 1,
        hashAlg: 'sha2-256'
    })) {
        cids.push(result.cid);
    }
    return cids;
}

export async function store(client: IPFS, fileLists: FileList[]): Promise<CID[][]> {
    const fileObjs = await Promise.all(fileLists.map(async files => toFileObjs(files)));
    // Need to be sequential to avoid lock bug
    // TODO: make it parallel and remember file positions for performance
    const cidsByCategory: CID[][] = [];
    for (let i = 0; i < fileObjs.length; i++) {
        const cids = await addAll(client, fileObjs[i]);
        cidsByCategory.push(cids);
    }
    console.log(`Cids by category: ${cidsByCategory}`);
    return cidsByCategory;
}

async function getFileContent(client: IPFS, cid: string): Promise<Uint8Array> {
    const chunks = [];
    for await (const chunk of client.cat(cid)) {
        chunks.push(chunk);
    }
    return uint8ArrayConcat(chunks);
}

export async function getFilesContents(client: IPFS, cids: string[]): Promise<Uint8Array[]> {
    return Promise.all(cids.map(cid => getFileContent(client, cid)));
}

export async function createClient(): Promise<IPFS> {
    return create({ repo: "nft-maker-local" });
}