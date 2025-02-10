import { bcs } from "@mysten/sui/bcs";
import { Transaction as TX } from "@mysten/sui/transactions";

// 修改常量定義，加上 export
export const PACKAGE_ID = '0x370332371f5d6119d32e6a36ba231faea4627649280dd60722a51724c60effc2';
export const STATE_ID = '0x9b70b65015f554caef63cd94b3f2bc6bd6b2e2bd6dbb7b187894a260f108c25a';

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
  osId: string,  // 臨時使用假值
  name: string,
  blobId: string
) => {
  console.log('createMemento params:', { osId, name, blobId });
  
  const tx = new TX();
  tx.moveCall({
    target: `${PACKAGE_ID}::memento::create_memento`,
    arguments: [
      tx.object(osId),  // 臨時使用假值
      tx.pure(bcs.string().serialize(name).toBytes()),
      tx.pure(bcs.string().serialize(blobId).toBytes()),
    ],
  });
  return tx;
}; 