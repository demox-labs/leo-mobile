import React from 'react'

import { SvgProps } from 'react-native-svg'
import { areAllPropsEqual } from '@src/utils/helpers'
import colors, { getColorHex, isColorCode } from '@src/utils/colors'
import { ColorCode } from '@src/types/colors'

import Activities from '@src/assets/svgs/tabs/base/activities.svg'
import ActivitiesSelected from '@src/assets/svgs/tabs/selected/activities-selected.svg'
import AddBox from '@src/assets/svgs/add-box.svg'
import AddFill from '@src/assets/svgs/add-fill.svg'
import AleoLetter from '@src/assets/svgs/aleo-letter.svg'
import AleoNetworkIcon from '@src/assets/svgs/aleo-network-icon.svg'
import Apps from '@src/assets/svgs/apps.svg'
import ArrowLeft from '@src/assets/svgs/arrow-left.svg'
import ArrowRight from '@src/assets/svgs/arrow-right.svg'
import ArrowDownSLine from '@src/assets/svgs/arrow-down-s-line.svg'
import ArrowRightUpFill from '@src/assets/svgs/arrow-right-up-fill.svg'
import ArrowRightDownFill from '@src/assets/svgs/arrow-right-down-fill.svg'
import ArrowRightUp from '@src/assets/svgs/arrow-right-up.svg'
import ArrowUpDown from '@src/assets/svgs/arrow-up-down.svg'
import AuthSplashIcon from '@src/assets/svgs/auth-splash-icon.svg'
import BackgroundCircle from '@src/assets/svgs/background-circle.svg'
import Bookmark from '@src/assets/svgs/bookmark.svg'
import BuiltWithAleo from '@src/assets/svgs/built-with-aleo.svg'
import CheckboxCircle from '@src/assets/svgs/checkbox-circle.svg'
import CheckboxCircleFill from '@src/assets/svgs/checkbox-circle-fill.svg'
import ChevronRight from '@src/assets/svgs/chevron-right.svg'
import ChevronDown from '@src/assets/svgs/chevron-down.svg'
import CircleLoader from '@src/assets/svgs/circle-loader.svg'
import CloseCircle from '@src/assets/svgs/close-circle.svg'
import CloseCircleFill from '@src/assets/svgs/close-circle-fill.svg'
import CloseFill from '@src/assets/svgs/close-fill.svg'
import ContactsBook from '@src/assets/svgs/contacts-book.svg'
import ConvertButton from '@src/assets/svgs/convert-button.svg'
import Coins from '@src/assets/svgs/coins.svg'
import EncryptedPadlock from '@src/assets/svgs/encrypted-padlock.svg'
import Eye from '@src/assets/svgs/eye.svg'
import EyeOff from '@src/assets/svgs/eye-off.svg'
import ExternalLink from '@src/assets/svgs/external-link.svg'
import Browser from '@src/assets/svgs/tabs/base/browser.svg'
import BrowserSelected from '@src/assets/svgs/tabs/selected/browser-selected.svg'
import DemoAleo from '@src/assets/svgs/demo-aleo.svg'
import FaucetButton from '@src/assets/svgs/faucet-button.svg'
import File from '@src/assets/svgs/file.svg'
import FileCopy from '@src/assets/svgs/file-copy.svg'
import FileSettings from '@src/assets/svgs/file-settings.svg'
import FlashRefresh from '@src/assets/svgs/flash-refresh.svg'
import Globe from '@src/assets/svgs/globe.svg'
import Hammer from '@src/assets/svgs/hammer.svg'
import Home from '@src/assets/svgs/tabs/base/home.svg'
import HomeSelected from '@src/assets/svgs/tabs/selected/home-selected.svg'
import ImagePrivate from '@src/assets/svgs/image-private.svg'
import ImagePublic from '@src/assets/svgs/image-public.svg'
import Information from '@src/assets/svgs/information.svg'
import IndeterminateCircle from '@src/assets/svgs/indeterminate-circle.svg'
import Key from '@src/assets/svgs/key.svg'
import LeoLogoAndName from '@src/assets/svgs/leo-logo-and-name.svg'
import LeoLogoAndNameCentered from '@src/assets/svgs/leo-logo-and-name-centered.svg'
import LeoLogoAndNameHorizontal from '@src/assets/svgs/leo-logo-and-name-horizontal.svg'
import LeoLogoBlue from '@src/assets/svgs/leo-logo-blue.svg'
import LeoLogoPurple from '@src/assets/svgs/leo-logo-purple.svg'
import Lock from '@src/assets/svgs/lock.svg'
import NFTs from '@src/assets/svgs/tabs/base/nfts.svg'
import NFTsSelected from '@src/assets/svgs/tabs/selected/nfts-selected.svg'
import Plus from '@src/assets/svgs/plus.svg'
import ReceiveButton from '@src/assets/svgs/receive-button.svg'
import Refresh from '@src/assets/svgs/refresh.svg'
import RoundLock from '@src/assets/svgs/round-lock.svg'
import Search from '@src/assets/svgs/search.svg'
import SendButton from '@src/assets/svgs/send-button.svg'
import Settings from '@src/assets/svgs/tabs/base/settings.svg'
import Settings2 from '@src/assets/svgs/settings-2.svg'
import SettingsSelected from '@src/assets/svgs/tabs/selected/settings-selected.svg'
import ShareFordward from '@src/assets/svgs/share-fordward.svg'
import ShieldCheckFill from '@src/assets/svgs/shield-check-fill.svg'
import StakeBlackButton from '@src/assets/svgs/stake-black-button.svg'
import StakeButton from '@src/assets/svgs/stake-button.svg'
import ToastDanger from '@src/assets/svgs/toast-danger.svg'
import ToastInfo from '@src/assets/svgs/toast-info.svg'
import ToastSuccess from '@src/assets/svgs/toast-success.svg'
import User from '@src/assets/svgs/user.svg'
import FaceId from '@src/assets/svgs/face-id.svg'
import Scan from '@src/assets/svgs/scan.svg'
import ToastWarning from '@src/assets/svgs/toast-warning.svg'
import WarningFill from '@src/assets/svgs/warning-fill.svg'

export enum IconNames {
  'add-box',
  'add-fill',
  'activities',
  'activities-selected',
  'aleo-letter',
  'aleo-network-icon',
  'apps',
  'arrow-left',
  'arrow-down-s-line',
  'arrow-right',
  'arrow-right-up-fill',
  'arrow-right-down-fill',
  'arrow-right-up',
  'arrow-up-down',
  'auth-splash-icon',
  'background-circle',
  'bookmark',
  'browser',
  'browser-selected',
  'built-with-aleo',
  'checkbox-circle',
  'checkbox-circle-fill',
  'circle-loader',
  'close-circle',
  'close-circle-fill',
  'close-fill',
  'contacts-book',
  'convert-button',
  'coins',
  'chevron-right',
  'chevron-down',
  'demo-aleo',
  'encrypted-padlock',
  'eye',
  'eye-off',
  'external-link',
  'faucet-button',
  'face-id',
  'file',
  'file-copy',
  'file-settings',
  'flash-refresh',
  'globe',
  'hammer',
  'home',
  'home-selected',
  'image-private',
  'image-public',
  'indeterminate-circle',
  'information',
  'key',
  'leo-logo-and-name',
  'leo-logo-and-name-centered',
  'leo-logo-and-name-horizontal',
  'leo-logo-blue',
  'leo-logo-purple',
  'lock',
  'nfts',
  'nfts-selected',
  'plus',
  'receive-button',
  'refresh',
  'round-lock',
  'search',
  'send-button',
  'settings',
  'settings-2',
  'settings-selected',
  'share-fordward',
  'shield-check-fill',
  'stake-black-button',
  'stake-button',
  'danger',
  'info',
  'success',
  'warning',
  'user',
  'scan',
  'warning-fill',
}
export type IconNamesUnion = keyof typeof IconNames

export interface IconProps extends SvgProps {
  name: IconNamesUnion
  color?: string
  size?: number
}

/*
  If you want to change the color of the icon,
  make sure that the corresponding svg file has not the 'fill' property defined
  to a hardcoded color value (if so, remove it).
  If the svg file has the 'fill' property defined, the color will not change.

  For example, see the 'leo-logo-blue.svg' file and the usage of the corresponding 
  LeoLogoBlue component below.
*/

const Icon = React.memo(({ name, color, size, ...rest }: IconProps) => {
  if (color !== undefined && rest.fill === undefined) {
    if (isColorCode(color)) {
      rest.fill = getColorHex(color as ColorCode)
    } else {
      rest.fill = color
    }
  }

  if (size !== undefined) {
    rest.width = size
    rest.height = size
  }

  switch (name) {
    case 'activities':
      return <Activities {...rest} />
    case 'activities-selected':
      return <ActivitiesSelected {...rest} />
    case 'add-box':
      return <AddBox {...rest} />
    case 'add-fill':
      return <AddFill {...rest} />
    case 'aleo-letter':
      return <AleoLetter {...rest} />
    case 'aleo-network-icon':
      return <AleoNetworkIcon {...rest} />
    case 'apps':
      return <Apps {...rest} />
    case 'arrow-left':
      return <ArrowLeft {...rest} />
    case 'arrow-down-s-line':
      return <ArrowDownSLine {...rest} />
    case 'arrow-right':
      return <ArrowRight {...rest} />
    case 'arrow-right-up-fill':
      return <ArrowRightUpFill {...rest} fill={rest.fill ?? 'black'} />
    case 'arrow-right-down-fill':
      return <ArrowRightDownFill {...rest} fill={rest.fill ?? 'black'} />
    case 'arrow-right-up':
      return <ArrowRightUp {...rest} />
    case 'arrow-up-down':
      return <ArrowUpDown {...rest} />
    case 'auth-splash-icon':
      return <AuthSplashIcon {...rest} />
    case 'background-circle':
      return <BackgroundCircle {...rest} />
    case 'bookmark':
      return <Bookmark {...rest} />
    case 'built-with-aleo':
      return <BuiltWithAleo {...rest} />
    case 'checkbox-circle':
      return <CheckboxCircle {...rest} />
    case 'checkbox-circle-fill':
      // Set default fill color to green-500 as the 'fill' property is not defined in the svg file
      return (
        <CheckboxCircleFill {...rest} fill={rest.fill ?? colors.green['500']} />
      )
    case 'chevron-right':
      return <ChevronRight {...rest} />
    case 'chevron-down':
      return <ChevronDown {...rest} />
    case 'circle-loader':
      // Set default fill color to black as the 'fill' property is not defined in the svg file
      return <CircleLoader {...rest} fill={rest.fill ?? 'black'} />
    case 'close-circle':
      return <CloseCircle {...rest} />
    case 'close-circle-fill':
      return <CloseCircleFill {...rest} />
    case 'close-fill':
      return <CloseFill {...rest} fill={rest.fill ?? 'black'} />
    case 'contacts-book':
      return <ContactsBook {...rest} />
    case 'convert-button':
      return <ConvertButton {...rest} />
    case 'coins':
      return <Coins {...rest} />
    case 'danger':
      return <ToastDanger {...rest} />
    case 'demo-aleo':
      return <DemoAleo {...rest} />
    case 'browser':
      return <Browser {...rest} />
    case 'browser-selected':
      return <BrowserSelected {...rest} />
    case 'encrypted-padlock':
      return <EncryptedPadlock {...rest} />
    case 'eye':
      return <Eye {...rest} />
    case 'eye-off':
      return <EyeOff {...rest} />
    case 'external-link':
      return <ExternalLink {...rest} />
    case 'face-id':
      return <FaceId {...rest} />
    case 'faucet-button':
      return <FaucetButton {...rest} />
    case 'file':
      return <File {...rest} />
    case 'file-copy':
      return <FileCopy {...rest} />
    case 'file-settings':
      return <FileSettings {...rest} />
    case 'flash-refresh':
      return <FlashRefresh {...rest} />
    case 'globe':
      return <Globe {...rest} fill={rest.fill ?? colors.gray['500']} />
    case 'hammer':
      return <Hammer {...rest} />
    case 'home':
      return <Home {...rest} />
    case 'home-selected':
      return <HomeSelected {...rest} />
    case 'image-public':
      return <ImagePublic {...rest} />
    case 'image-private':
      return <ImagePrivate {...rest} />
    case 'indeterminate-circle':
      return <IndeterminateCircle {...rest} />
    case 'information':
      // Set default fill color to black as the 'fill' property is not defined in the svg file
      return <Information {...rest} fill={rest.fill ?? 'black'} />
    case 'info':
      return <ToastInfo {...rest} fill={rest.fill ?? colors.blue['500']} />
    case 'key':
      return <Key {...rest} />
    case 'leo-logo-blue':
      // Set default fill color to blue-500 as the 'fill' property is not defined in the svg file
      return <LeoLogoBlue {...rest} fill={rest.fill ?? colors.blue['500']} />
    case 'leo-logo-purple':
      return <LeoLogoPurple {...rest} />
    case 'leo-logo-and-name':
      return <LeoLogoAndName {...rest} />
    case 'leo-logo-and-name-centered':
      return <LeoLogoAndNameCentered {...rest} />
    case 'lock':
      return <Lock {...rest} />
    case 'leo-logo-and-name-horizontal':
      return <LeoLogoAndNameHorizontal {...rest} />
    case 'nfts':
      return <NFTs {...rest} />
    case 'nfts-selected':
      return <NFTsSelected {...rest} />
    case 'plus':
      return <Plus {...rest} />
    case 'round-lock':
      return <RoundLock {...rest} />
    case 'receive-button':
      return <ReceiveButton {...rest} />
    case 'refresh':
      return <Refresh {...rest} fill={rest.fill ?? 'black'} />
    case 'send-button':
      return <SendButton {...rest} />
    case 'search':
      return <Search {...rest} />
    case 'stake-black-button':
      return <StakeBlackButton {...rest} />
    case 'stake-button':
      return <StakeButton {...rest} />
    case 'settings':
      return <Settings {...rest} />
    case 'settings-2':
      return <Settings2 {...rest} />
    case 'settings-selected':
      return <SettingsSelected {...rest} />
    case 'share-fordward':
      return <ShareFordward {...rest} />
    case 'shield-check-fill':
      return <ShieldCheckFill {...rest} />
    case 'success':
      return <ToastSuccess {...rest} fill={rest.fill ?? '#59C581'} />
    case 'user':
      return <User {...rest} />
    case 'scan':
      return <Scan {...rest} />
    case 'warning':
      return <ToastWarning {...rest} />
    case 'warning-fill':
      return <WarningFill {...rest} />
    default:
      return null
  }
}, areAllPropsEqual)

Icon.displayName = 'Icon'

export default Icon
