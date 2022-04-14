import { create, CID } from 'ipfs-core';

export async function store(files: FileList): Promise<CID[]> {
    const client = await create();
    const fileObjs = await Promise.all(Array.from(files).map(async f => {
        return {
            path: f.name,
            content: new Uint8Array(await f.arrayBuffer())
        }
    }));
    const cids: CID[] = [];
    for await (const result of client.addAll(fileObjs, {
        cidVersion: 1,
        hashAlg: 'sha2-256'
    })) {
        cids.push(result.cid);
    }
    console.log(cids.map(cid => cid.toString()));
    return cids;
}