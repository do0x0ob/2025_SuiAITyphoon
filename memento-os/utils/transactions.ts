import { bcs } from "@mysten/sui/bcs";
import { Transaction as TX } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0x1c806d19711f0a97e35acd652c01e42b5e8a0ddac2d17575780989f33069d317';
export const STATE_ID = '0x5e33b087a21a6c9d92e3f1f63b21958e31bcb83d3e33cec66a74146e44e1ecab';

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