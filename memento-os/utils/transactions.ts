import { bcs } from "@mysten/sui/bcs";
import { Transaction as TX } from "@mysten/sui/transactions";

// 修改常量定義，加上 export
export const PACKAGE_ID = '0x8814ad4890c61565aa6ad2b6b66c3c00ed05b9ad1f16b57048f93c7a62160597';
export const STATE_ID = '0x2a5088f6d5e7ba48a42f5575da4b404538e6566c45e71214f7fc092add2c1857';

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