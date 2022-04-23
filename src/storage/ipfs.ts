import { create, CID, IPFS } from 'ipfs-core';
import { flatten} from "lodash";

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

export async function store(fileLists: FileList[]): Promise<CID[][]> {
    const client = await create();
    const fileObjs = await Promise.all(fileLists.map(async files => toFileObjs(files)));
    // Need to be sequential to avoid lock bug
    // TODO: make it parallel and remember file positions for performance
    const cidsByCategory: CID[][] = [];
    for (let i = 0; i < fileObjs.length; i++) {
        const cids = await addAll(client, fileObjs[i]);
        cidsByCategory.push(cids);
    }
    return cidsByCategory;
}