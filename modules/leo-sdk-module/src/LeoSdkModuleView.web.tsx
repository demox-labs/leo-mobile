import * as React from 'react';

import { LeoSdkModuleViewProps } from './LeoSdkModule.types';

export default function LeoSdkModuleView(props: LeoSdkModuleViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
