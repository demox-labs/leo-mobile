package expo.modules.leosdkmodule

import android.util.Base64

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.functions.Coroutine

class LeoSdkModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('LeoSdkModule')` in JavaScript.
    Name("LeoSdkModule")

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(LeoSdkModuleView::class) {
      // Defines a setter for the `name` prop.
      Prop("name") { view: LeoSdkModuleView, prop: String ->
        println(prop)
      }
    }

    // Rust-based Aleo SDK functions

    AsyncFunction("addressIsValid") { network: String, address: String ->
      try {
        addressIsValid(network, address)
      } catch (e: Exception) {
        throw e
      }
    }

    AsyncFunction("addressToXCoordinate") { network: String, address: String ->
      try {
        addressToXCoordinate(network, address)
      } catch (e: SdkException) {
        throw e
      }
    }

    AsyncFunction("authorizeTransaction") { networkAndPrivateKey: List<String>, program: String, function: String, inputs: List<String>, feeCredits: Double, feeRecord: String?, imports: String? ->
      try {
        val network = networkAndPrivateKey[0]
        val privateKey = networkAndPrivateKey[1]
        authorizeTransaction(network, privateKey, program, function, inputs, feeCredits, feeRecord, imports)
      } catch (e: SdkException) {
        throw e
      }
    }

    AsyncFunction("decryptCiphertext") { network: String, viewKey: String, ciphertext: String, tpk: String, programId: String, functionName: String, indexDouble: Double ->
      try {
        val index = indexDouble.toULong()
        val result = decryptCiphertext(network, viewKey, ciphertext, tpk, programId, functionName, index)
      } catch (e: SdkException) {
          throw e
      } catch (e: Exception) {
          throw e
      }
    }

    AsyncFunction("decryptRecord") { network: String, viewKey: String, recordCiphertext: String ->
      try {
        decryptRecord(network, viewKey, recordCiphertext)
      } catch (e: SdkException) {
        throw e
      }
    }

    AsyncFunction("decryptTransition") { network: String, viewKey: String, transition: String ->
      try {
        decryptTransition(network, viewKey, transition)
      } catch (e: SdkException) {
        throw e
      }
    }

    AsyncFunction("encryptRecord") { network: String, viewKey: String, recordPlaintext: String ->
      try {
        encryptRecord(network, viewKey, recordPlaintext)
      } catch (e: SdkException) {
        throw e
      }
    }

    AsyncFunction("executeAuthorization") { network: String, authorizationJson: String, feeAuthorizationJson: String?, program: String, imports: String?, function: String, restEndpoint: String ->
      try {
        SdkExecute.executeAuthorization(network, authorizationJson, feeAuthorizationJson, program, imports, function, restEndpoint)
      } catch (e: SdkException) {
        throw e
      }
    }

    AsyncFunction("fromSeedUnchecked") { network: String, seedBase64: String ->
      try {
        val seed = Base64.decode(seedBase64, Base64.NO_WRAP)
        fromSeedUnchecked(network, seed)
      } catch (e: SdkException) {
        throw e
      }
    }

    AsyncFunction("isRecordOwner") { network: String, viewKey: String, addressXCoordinate: String, recordNonce: String, recordOwnerXCoordinate: String ->
      try {
        isRecordOwner(network, viewKey, addressXCoordinate, recordNonce, recordOwnerXCoordinate)
      } catch (e: Exception) {
        throw e
      }
    }

    AsyncFunction("ownsTransition") { network: String, viewKey: String, tpkStr: String, tcmStr: String ->
      try {
        ownsTransition(network, viewKey, tpkStr, tcmStr)
      } catch (e: Exception) {
        throw e
      }
    }

    AsyncFunction("privateKeyIsValid") { network: String, privateKey: String ->
      try {
        privateKeyIsValid(network, privateKey)
      } catch (e: Exception) {
        throw e
      }
    }

    AsyncFunction("privateKeyNew") { network: String ->
      try {
        privateKeyNew(network)
      } catch (e: SdkException) {
        throw e
      }
    }

    AsyncFunction("privateKeyToAddress") { network: String, privateKey: String ->
      try {
        privateKeyToAddress(network, privateKey)
      } catch (e: SdkException) {
        throw e
      }
    }

    AsyncFunction("privateKeyToViewKey") { network: String, privateKey: String ->
      try {
        privateKeyToViewKey(network, privateKey)
      } catch (e: SdkException) {
        throw e
      }
    }

    AsyncFunction("programIsValid") { network: String, program: String ->
      try {
        programIsValid(network, program)
      } catch (e: Exception) {
        throw e
      }
    }

    AsyncFunction("programToId") { network: String, program: String ->
      try {
        programToId(network, program)
      } catch (e: SdkException) {
        throw e
      }
    }

    AsyncFunction("serialNumberString") { network: String, recordPlaintext: String, privateKey: String, programId: String, recordName: String ->
      try {
        serialNumberString(network, recordPlaintext, privateKey, programId, recordName)
      } catch (e: SdkException) {
        throw e
      }
    }
    AsyncFunction("sign") { network: String, privateKey: String, messageBase64: String ->
      try {
        val message = Base64.decode(messageBase64, Base64.NO_WRAP)
        sign(network, privateKey, message)
      } catch (e: SdkException) {
        throw e
      }
    }
    AsyncFunction("verify") { network: String, signature: String, messageBase64: String, address: String ->
      try {
        val message = Base64.decode(messageBase64, Base64.NO_WRAP)
        verify(network, signature, message, address)
      } catch (e: Exception) {
        throw e
      }
    }
    AsyncFunction("viewKeyIsValid") { network: String, viewKey: String ->
      try {
        viewKeyIsValid(network, viewKey)
      } catch (e: Exception) {
        throw e
      }
    }
    AsyncFunction("viewKeyToAddress") { network: String, viewKey: String ->
      try {
        viewKeyToAddress(network, viewKey)
      } catch (e: SdkException) {
        throw e
      }
    }
  }
}
