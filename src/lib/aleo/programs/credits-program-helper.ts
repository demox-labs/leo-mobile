export const CREDITS_HELPER_PROGRAM =
  'import credits.aleo;\n\nprogram aleo_credits_helper_v0_0_1.aleo;\n\nfunction transfer_2_private:\n    input r0 as address.private;\n    input r1 as u64.private;\n    input r2 as credits.aleo/credits.record;\n    input r3 as credits.aleo/credits.record;\n    call credits.aleo/join r2 r3 into r4;\n    call credits.aleo/transfer_private r4 r0 r1 into r5 r6;\n    output r5 as credits.aleo/credits.record;\n    output r6 as credits.aleo/credits.record;\n'
export const CREDITS_HELPER_PROGRAM_ID = 'aleo_credits_helper_v0_0_1.aleo'
