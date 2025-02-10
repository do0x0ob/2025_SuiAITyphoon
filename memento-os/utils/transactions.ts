import { bcs } from "@mysten/sui/bcs";
import { Transaction as TX } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0xbcc5146abc141c4835c730cd54f1573ea9d2903f45d2f7281813b8078de872c9';
export const STATE_ID = '0xf38d2b5ae2b4ab0dab88bee03fd96b0c01808ba2305696a30b866511a3b7dc6c';

export const mintOS = async (username: string, settings_blob: string = "") => {
  console.log('mintOS params:', username, settings_blob);
  
  const tx = new TX();
  tx.moveCall({
    target: `${PACKAGE_ID}::memento::mint_os`,
    arguments: [
      tx.object(STATE_ID),
      tx.pure(bcs.string().serialize(username).toBytes()),
      tx.pure(bcs.string().serialize(settings_blob).toBytes()),
    ],
  });
  return tx;
};

export const createMemento = async (
  osId: string,
  name: string,
  blobId: string
) => {
  console.log('createMemento params:', { osId, name, blobId });
  
  const tx = new TX();
  tx.moveCall({
    target: `${PACKAGE_ID}::memento::create_memento`,
    arguments: [
      tx.object(osId),
      tx.pure(bcs.string().serialize(name).toBytes()),
      tx.pure(bcs.string().serialize(blobId).toBytes()),
    ],
  });
  return tx;
};

export const createMoment = async (
  osId: string,
  title: string,
  description: string,
  date: string,
  blobId?: string
) => {
  const tx = new TX();
  tx.moveCall({
    target: `${PACKAGE_ID}::memento::create_moment`,
    arguments: [
      tx.object(osId),
      tx.pure(bcs.string().serialize(title).toBytes()),
      tx.pure(bcs.string().serialize(description).toBytes()),
      tx.pure(blobId ? bcs.option(bcs.string()).serialize(blobId).toBytes() : bcs.option(bcs.string()).serialize(null).toBytes()),
      tx.pure(bcs.string().serialize(date).toBytes()),
    ],
  });
  return tx;
}; 