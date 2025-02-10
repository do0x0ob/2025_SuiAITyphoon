import { bcs } from "@mysten/sui/bcs";
import { Transaction as TX } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0x0d770311943b62d983795874dc490b1dde5519d81070c37b75422139a6411011';
export const STATE_ID = '0x8f1361249afeafb4667f2cd97efb0b4a4d71a8cf1fa55259c42017281f5a8f2e';

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
    ],
  });
  return tx;
}; 