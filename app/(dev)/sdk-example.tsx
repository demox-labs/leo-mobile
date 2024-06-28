import React from 'react'
import SDKExampleScreen from '@src/screens/sdk-example'
import {
  addressToXCoordinate,
  authorizeTransaction,
  decryptRecord,
  executeAuthorization,
  fromSeedUnchecked,
  isRecordOwner,
  privateKeyNew,
  privateKeyToAddress,
  privateKeyToViewKey,
  programToId,
} from '../../modules/leo-sdk-module'

const CreditsProgram = `
program credits.aleo;\n\nmapping committee:\n    key as address.public;\n    value as committee_state.public;\n\nstruct committee_state:\n    microcredits as u64;\n    is_open as boolean;\n\nmapping bonded:\n    key as address.public;\n    value as bond_state.public;\n\nstruct bond_state:\n    validator as address;\n    microcredits as u64;\n\nmapping unbonding:\n    key as address.public;\n    value as unbond_state.public;\n\nstruct unbond_state:\n    microcredits as u64;\n    height as u32;\n\nmapping account:\n    key as address.public;\n    value as u64.public;\n\nrecord credits:\n    owner as address.private;\n    microcredits as u64.private;\n\nfunction bond_public:\n    input r0 as address.public;\n    input r1 as u64.public;\n    gte r1 1000000u64 into r2;\n    assert.eq r2 true ;\n    async bond_public self.caller r0 r1 into r3;\n    output r3 as credits.aleo/bond_public.future;\n\nfinalize bond_public:\n    input r0 as address.public;\n    input r1 as address.public;\n    input r2 as u64.public;\n    is.eq r0 r1 into r3;\n    branch.eq r3 true to bond_validator;\n    branch.eq r3 false to bond_delegator;\n    position bond_validator;\n    cast 0u64 true into r4 as committee_state;\n    get.or_use committee[r0] r4 into r5;\n    assert.eq r5.is_open true ;\n    add r5.microcredits r2 into r6;\n    cast r6 r5.is_open into r7 as committee_state;\n    cast r1 0u64 into r8 as bond_state;\n    get.or_use bonded[r0] r8 into r9;\n    assert.eq r9.validator r1 ;\n    add r9.microcredits r2 into r10;\n    gte r10 1000000000000u64 into r11;\n    assert.eq r11 true ;\n    cast r1 r10 into r12 as bond_state;\n    get account[r0] into r13;\n    sub r13 r2 into r14;\n    set r7 into committee[r0];\n    set r12 into bonded[r0];\n    set r14 into account[r0];\n    branch.eq true true to end;\n    position bond_delegator;\n    contains committee[r0] into r15;\n    assert.eq r15 false ;\n    get committee[r1] into r16;\n    assert.eq r16.is_open true ;\n    add r16.microcredits r2 into r17;\n    cast r17 r16.is_open into r18 as committee_state;\n    cast r1 0u64 into r19 as bond_state;\n    get.or_use bonded[r0] r19 into r20;\n    assert.eq r20.validator r1 ;\n    add r20.microcredits r2 into r21;\n    gte r21 10000000u64 into r22;\n    assert.eq r22 true ;\n    cast r1 r21 into r23 as bond_state;\n    get account[r0] into r24;\n    sub r24 r2 into r25;\n    set r18 into committee[r1];\n    set r23 into bonded[r0];\n    set r25 into account[r0];\n    position end;\n\nfunction unbond_public:\n    input r0 as u64.public;\n    async unbond_public self.caller r0 into r1;\n    output r1 as credits.aleo/unbond_public.future;\n\nfinalize unbond_public:\n    input r0 as address.public;\n    input r1 as u64.public;\n    cast 0u64 0u32 into r2 as unbond_state;\n    get.or_use unbonding[r0] r2 into r3;\n    add block.height 360u32 into r4;\n    contains committee[r0] into r5;\n    branch.eq r5 true to unbond_validator;\n    branch.eq r5 false to unbond_delegator;\n    position unbond_validator;\n    get committee[r0] into r6;\n    sub r6.microcredits r1 into r7;\n    get bonded[r0] into r8;\n    assert.eq r8.validator r0 ;\n    sub r8.microcredits r1 into r9;\n    gte r9 1000000000000u64 into r10;\n    branch.eq r10 true to decrement_validator;\n    branch.eq r10 false to remove_validator;\n    position decrement_validator;\n    cast r7 r6.is_open into r11 as committee_state;\n    set r11 into committee[r0];\n    cast r0 r9 into r12 as bond_state;\n    set r12 into bonded[r0];\n    add r3.microcredits r1 into r13;\n    cast r13 r4 into r14 as unbond_state;\n    set r14 into unbonding[r0];\n    branch.eq true true to end;\n    position remove_validator;\n    assert.eq r6.microcredits r8.microcredits ;\n    remove committee[r0];\n    remove bonded[r0];\n    add r3.microcredits r8.microcredits into r15;\n    cast r15 r4 into r16 as unbond_state;\n    set r16 into unbonding[r0];\n    branch.eq true true to end;\n    position unbond_delegator;\n    get bonded[r0] into r17;\n    sub r17.microcredits r1 into r18;\n    gte r18 10000000u64 into r19;\n    branch.eq r19 true to decrement_delegator;\n    branch.eq r19 false to remove_delegator;\n    position decrement_delegator;\n    get committee[r17.validator] into r20;\n    sub r20.microcredits r1 into r21;\n    cast r21 r20.is_open into r22 as committee_state;\n    set r22 into committee[r17.validator];\n    cast r17.validator r18 into r23 as bond_state;\n    set r23 into bonded[r0];\n    add r3.microcredits r1 into r24;\n    cast r24 r4 into r25 as unbond_state;\n    set r25 into unbonding[r0];\n    branch.eq true true to end;\n    position remove_delegator;\n    get committee[r17.validator] into r26;\n    sub r26.microcredits r17.microcredits into r27;\n    cast r27 r26.is_open into r28 as committee_state;\n    set r28 into committee[r17.validator];\n    remove bonded[r0];\n    add r3.microcredits r17.microcredits into r29;\n    cast r29 r4 into r30 as unbond_state;\n    set r30 into unbonding[r0];\n    position end;\n\nfunction unbond_delegator_as_validator:\n    input r0 as address.public;\n    async unbond_delegator_as_validator self.caller r0 into r1;\n    output r1 as credits.aleo/unbond_delegator_as_validator.future;\n\nfinalize unbond_delegator_as_validator:\n    input r0 as address.public;\n    input r1 as address.public;\n    get committee[r0] into r2;\n    assert.eq r2.is_open false ;\n    contains committee[r1] into r3;\n    assert.eq r3 false ;\n    get bonded[r1] into r4;\n    assert.eq r4.validator r0 ;\n    sub r2.microcredits r4.microcredits into r5;\n    cast r5 r2.is_open into r6 as committee_state;\n    cast 0u64 0u32 into r7 as unbond_state;\n    get.or_use unbonding[r1] r7 into r8;\n    add r8.microcredits r4.microcredits into r9;\n    add block.height 360u32 into r10;\n    cast r9 r10 into r11 as unbond_state;\n    set r6 into committee[r0];\n    remove bonded[r1];\n    set r11 into unbonding[r1];\n\nfunction claim_unbond_public:\n    async claim_unbond_public self.caller into r0;\n    output r0 as credits.aleo/claim_unbond_public.future;\n\nfinalize claim_unbond_public:\n    input r0 as address.public;\n    get unbonding[r0] into r1;\n    gte block.height r1.height into r2;\n    assert.eq r2 true ;\n    get.or_use account[r0] 0u64 into r3;\n    add r1.microcredits r3 into r4;\n    set r4 into account[r0];\n    remove unbonding[r0];\n\nfunction set_validator_state:\n    input r0 as boolean.public;\n    async set_validator_state self.caller r0 into r1;\n    output r1 as credits.aleo/set_validator_state.future;\n\nfinalize set_validator_state:\n    input r0 as address.public;\n    input r1 as boolean.public;\n    get committee[r0] into r2;\n    cast r2.microcredits r1 into r3 as committee_state;\n    set r3 into committee[r0];\n\nfunction transfer_public:\n    input r0 as address.public;\n    input r1 as u64.public;\n    async transfer_public self.caller r0 r1 into r2;\n    output r2 as credits.aleo/transfer_public.future;\n\nfinalize transfer_public:\n    input r0 as address.public;\n    input r1 as address.public;\n    input r2 as u64.public;\n    get account[r0] into r3;\n    sub r3 r2 into r4;\n    set r4 into account[r0];\n    get.or_use account[r1] 0u64 into r5;\n    add r5 r2 into r6;\n    set r6 into account[r1];\n\nfunction transfer_private:\n    input r0 as credits.record;\n    input r1 as address.private;\n    input r2 as u64.private;\n    sub r0.microcredits r2 into r3;\n    cast r1 r2 into r4 as credits.record;\n    cast r0.owner r3 into r5 as credits.record;\n    output r4 as credits.record;\n    output r5 as credits.record;\n\nfunction transfer_private_to_public:\n    input r0 as credits.record;\n    input r1 as address.public;\n    input r2 as u64.public;\n    sub r0.microcredits r2 into r3;\n    cast r0.owner r3 into r4 as credits.record;\n    async transfer_private_to_public r1 r2 into r5;\n    output r4 as credits.record;\n    output r5 as credits.aleo/transfer_private_to_public.future;\n\nfinalize transfer_private_to_public:\n    input r0 as address.public;\n    input r1 as u64.public;\n    get.or_use account[r0] 0u64 into r2;\n    add r1 r2 into r3;\n    set r3 into account[r0];\n\nfunction transfer_public_to_private:\n    input r0 as address.private;\n    input r1 as u64.public;\n    cast r0 r1 into r2 as credits.record;\n    async transfer_public_to_private self.caller r1 into r3;\n    output r2 as credits.record;\n    output r3 as credits.aleo/transfer_public_to_private.future;\n\nfinalize transfer_public_to_private:\n    input r0 as address.public;\n    input r1 as u64.public;\n    get account[r0] into r2;\n    sub r2 r1 into r3;\n    set r3 into account[r0];\n\nfunction join:\n    input r0 as credits.record;\n    input r1 as credits.record;\n    add r0.microcredits r1.microcredits into r2;\n    cast r0.owner r2 into r3 as credits.record;\n    output r3 as credits.record;\n\nfunction split:\n    input r0 as credits.record;\n    input r1 as u64.private;\n    sub r0.microcredits r1 into r2;\n    sub r2 10000u64 into r3;\n    cast r0.owner r1 into r4 as credits.record;\n    cast r0.owner r3 into r5 as credits.record;\n    output r4 as credits.record;\n    output r5 as credits.record;\n\nfunction fee_private:\n    input r0 as credits.record;\n    input r1 as u64.public;\n    input r2 as u64.public;\n    input r3 as field.public;\n    assert.neq r1 0u64 ;\n    assert.neq r3 0field ;\n    add r1 r2 into r4;\n    sub r0.microcredits r4 into r5;\n    cast r0.owner r5 into r6 as credits.record;\n    output r6 as credits.record;\n\nfunction fee_public:\n    input r0 as u64.public;\n    input r1 as u64.public;\n    input r2 as field.public;\n    assert.neq r0 0u64 ;\n    assert.neq r2 0field ;\n    add r0 r1 into r3;\n    async fee_public self.caller r3 into r4;\n    output r4 as credits.aleo/fee_public.future;\n\nfinalize fee_public:\n    input r0 as address.public;\n    input r1 as u64.public;\n    get account[r0] into r2;\n    sub r2 r1 into r3;\n    set r3 into account[r0];\n
`

const SDKExampleScreenRoute = () => {
  const generatePrivateKey = async () => {
    try {
      const pkString = await fromSeedUnchecked(
        'ampqampqampqampqampqampqampqampqampqampqamo=',
      )
      const keyString = await privateKeyNew()
      const addressString = await privateKeyToAddress(keyString)
      const viewKeyString = await privateKeyToViewKey(keyString)
      return (
        pkString + ' ' + keyString + ' ' + addressString + ' ' + viewKeyString
      )
    } catch (e) {
      console.error(e)
      return ''
    }
  }

  const decryptTest = async () => {
    const ciphertext =
      'record1qyqsqghu0c07hts0cg4njhh6mdj3td92jzxdsurm5k7a8fd7p3nnm9s2qyxx66trwfhkxun9v35hguerqqpqzqrn5h96qqw7dyggp400scf8eq2d7emduxc0p04ryu860lpxpqxwqt8vq7d37g47wzrmg9xznxy82xaejc5hzysswa2c96fj67cuamlsc7l6h78'
    // const serialNumber =
    //   '6936779757693383590561290098537962235562507228109138432906595816358786706357field'
    const privateKey =
      'APrivateKey1zkpEbCEwoiqytZZNekqQbTsnBnWQ1xe63bLPGTbRZDqVAz4'
    const viewKey = await privateKeyToViewKey(privateKey)
    const publicKey =
      'aleo1kf3dgrz9lqyklz8kqfy0hpxxyt78qfuzshuhccl02a5x43x6nqpsaapqru'
    const programId = await programToId(CreditsProgram)
    console.log('programId', programId, ' expect to be credits.aleo')
    const plaintext = await decryptRecord(viewKey, ciphertext)
    console.log('plaintext ', plaintext)
    const owner_x = await addressToXCoordinate(publicKey)
    const recordInfo = {
      nonce_x:
        '5879943567998887811233500701241985182722821694981645223591194034661607719118group',
      nonce_y:
        '3703989043893116413016724572865801234806885068942708990146722564047819471864',
      owner_x:
        '4788579330293257914468997585717588757081333606463659510733793582828631292962field',
    }
    const isOwner = await isRecordOwner(
      viewKey,
      owner_x,
      recordInfo.nonce_x,
      recordInfo.owner_x,
    )
    console.log('isOwner: ', isOwner)
  }

  const authorizeTx = async () => {
    await decryptTest()
    const privateKey =
      'APrivateKey1zkpEbCEwoiqytZZNekqQbTsnBnWQ1xe63bLPGTbRZDqVAz4'
    const authorization = await authorizeTransaction(
      privateKey,
      CreditsProgram,
      'transfer_private',
      [
        '{\n  owner: aleo1kf3dgrz9lqyklz8kqfy0hpxxyt78qfuzshuhccl02a5x43x6nqpsaapqru.private,\n  microcredits: 239664655u64.private,\n  _nonce: 2464432502247020218227083403351943428724291805267404155109668491898248719269group.public\n}',
        'aleo1uran94ddjnvdr0neh8d0mzxuvv77pyprnp7jmzpkuh7950t46qyqnsadey',
        '123000u64',
      ],
      3.14,
      null,
      '{}',
    )
    return authorization
  }

  const executeAuth = async (auth: string, feeAuth: string) => {
    const restEndpoint = 'https://api.explorer.aleo.org/v1'
    const transaction = await executeAuthorization(
      auth,
      feeAuth,
      CreditsProgram,
      '{}',
      'transfer_private',
      restEndpoint,
    )
    console.log('transaction', transaction)
    return transaction
  }

  return (
    <SDKExampleScreen
      onGeneratePrivateKeyPress={generatePrivateKey}
      onGenerateAuthorizationPress={authorizeTx}
      onExecuteAuthorizationPress={executeAuth}
    />
  )
}

export default SDKExampleScreenRoute
