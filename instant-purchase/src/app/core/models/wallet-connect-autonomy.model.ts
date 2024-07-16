export enum Chain {
  ethereum = 'eip155:1',
  tezos = 'tezos',
  autonomy = 'autonomy',
}

export enum AuMethod {
  permissions = 'au_permissions',
  sign = 'au_sign',
  sendTransaction = 'au_sendTransaction',
}

export class AutonomyPermission {
  signature: string;
  permissionResults: PermissionResult[];
}

class PermissionResult {
  type: string;
  result: ChainResult;
}

class ChainResult {
  chains: ChainInfo[];
}

export class ChainInfo {
  chain: Chain;
  address: string;
  signature: string;
  publicKey: string;
}
