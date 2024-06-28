import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { LeoSdkModuleViewProps } from './LeoSdkModule.types';

const NativeView: React.ComponentType<LeoSdkModuleViewProps> =
  requireNativeViewManager('LeoSdkModule');

export default function LeoSdkModuleView(props: LeoSdkModuleViewProps) {
  return <NativeView {...props} />;
}
