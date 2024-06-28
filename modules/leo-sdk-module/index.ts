import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to LeoSdkModule.web.ts
// and on native platforms to LeoSdkModule.ts
import LeoSdkModule from './src/LeoSdkModule';
import { ChangeEventPayload } from './src/LeoSdkModule.types';


// Rust-based Aleo SDK functions

export function addressIsValid(address: string): Promise<boolean> {
  return LeoSdkModule.addressIsValid('TestnetV0', address);
}

export function addressToXCoordinate(address: string): Promise<string> {
  return LeoSdkModule.addressToXCoordinate('TestnetV0', address);
}

export function authorizeTransaction(
  privateKey: string,
  program: string,
  functionStr: string,
  inputs: string[],
  feeCredits: number,
  feeRecord: string | null,
  imports: string | null
): Promise<string> {
  return LeoSdkModule.authorizeTransaction(['TestnetV0', privateKey], program, functionStr, inputs, feeCredits, feeRecord, imports);
}

export function decryptCiphertext(
  viewKey: string,
  ciphertext: string,
  tpk: string,
  programId: string,
  functionName: string,
  index: number
): Promise<string> {
  return LeoSdkModule.decryptCiphertext('TestnetV0', viewKey, ciphertext, tpk, programId, functionName, index);
}

export function decryptRecord(viewKey: string, recordCiphertext: string): Promise<string> {
  return LeoSdkModule.decryptRecord('TestnetV0', viewKey, recordCiphertext);
}

export function decryptTransition(viewKey: string, transition: string): Promise<string> {
  return LeoSdkModule.decryptTransition('TestnetV0', viewKey, transition);
}

export function encryptRecord(viewKey: string, recordPlaintext: string): Promise<string> {
  return LeoSdkModule.encryptRecord('TestnetV0', viewKey, recordPlaintext);
}

export function executeAuthorization(authorizationJson: string, feeAuthorizationJson: string | null, program: string, imports: string | null, functionStr: string, restEndpoint: string): Promise<string> {
  return LeoSdkModule.executeAuthorization('TestnetV0', authorizationJson, feeAuthorizationJson, program, imports, functionStr, restEndpoint);
}

export function fromSeedUnchecked(seed: string): Promise<string> {
  return LeoSdkModule.fromSeedUnchecked('TestnetV0', seed);
}

export function isRecordOwner(viewKey: string, addressXCoordinate: string, recordNonce: string, recordOwnerXCoordinate: string): Promise<boolean> {
  return LeoSdkModule.isRecordOwner('TestnetV0', viewKey, addressXCoordinate, recordNonce, recordOwnerXCoordinate);
}

export function ownsTransition(viewKey: string, tpkStr: string, tcmStr: string): Promise<boolean> {
  return LeoSdkModule.ownsTransition('TestnetV0', viewKey, tpkStr, tcmStr);
}

export function privateKeyIsValid(privateKey: string): Promise<boolean> {
  return LeoSdkModule.privateKeyIsValid('TestnetV0', privateKey);
}

export function privateKeyNew(): Promise<string> {
  return LeoSdkModule.privateKeyNew('TestnetV0');
}

export function privateKeyToAddress(privateKey: string): Promise<string> {
  return LeoSdkModule.privateKeyToAddress('TestnetV0', privateKey);
}

export function privateKeyToViewKey(privateKey: string): Promise<string> {
  return LeoSdkModule.privateKeyToViewKey('TestnetV0', privateKey);
}

export function programIsValid(program: string): Promise<boolean> {
  return LeoSdkModule.programIsValid('TestnetV0', program);
}

export function programToId(program: string): Promise<string> {
  return LeoSdkModule.programToId('TestnetV0', program);
}

export function serialNumberString(recordPlaintext: string, privateKey: string, programId: string, recordName: string): Promise<string> {
  return LeoSdkModule.serialNumberString('TestnetV0', recordPlaintext, privateKey, programId, recordName);
}

export function sign(privateKey: string, message: string): Promise<string> {
  return LeoSdkModule.sign('TestnetV0', privateKey, message);
}

export function verify(signature: string, message: string, address: string): Promise<boolean> {
  return LeoSdkModule.verify('TestnetV0', signature, message, address);
}

export function viewKeyIsValid(viewKey: string): Promise<boolean> {
  return LeoSdkModule.viewKeyIsValid('TestnetV0', viewKey);
}

export function viewKeyToAddress(viewKey: string): Promise<string> {
  return LeoSdkModule.viewKeyToAddress('TestnetV0', viewKey);
}

export { ChangeEventPayload };
