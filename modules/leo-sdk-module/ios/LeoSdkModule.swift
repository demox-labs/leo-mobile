import ExpoModulesCore
import Foundation

public class LeoSdkModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('LeoSdkModule')` in JavaScript.
    Name("LeoSdkModule")

    AsyncFunction("addressIsValid") { (network: String, address: String, promise: Promise) in
      let result = Sdk.addressIsValid(network: network, address: address)
      promise.resolve(result)
    }

    AsyncFunction("addressToXCoordinate") { (network: String, address: String, promise: Promise) in
      do {
          let result = try Sdk.addressToXCoordinate(network: network, address: address)
          promise.resolve(result)
      } catch {
          promise.reject("error", error.localizedDescription)
      }
    }

    // AsyncFunction has a limit of 8 inputs including the promise, so we group the network and privateKey into a single input
    AsyncFunction("authorizeTransaction") { (
        networkAndPrivateKey: [String],
        program: String,
        function: String,
        inputs: [String],
        feeCredits: Double,
        feeRecord: String?,
        imports: String?,
        promise: Promise
    ) in
      do {
          let network = networkAndPrivateKey[0]
          let privateKey = networkAndPrivateKey[1]
          let result = try Sdk.authorizeTransaction(network: network, privateKey: privateKey, program: program, function: function, inputs: inputs, feeCredits: feeCredits, feeRecord: feeRecord, imports: imports)
          promise.resolve(result)
      } catch {
          promise.reject("error", error.localizedDescription)
      }
    }

    AsyncFunction("decryptCiphertext") { (network: String, viewKey: String, ciphertext: String, tpk: String, programId: String, functionName: String, indexDouble: Double, promise: Promise) in
        let indexValue = UInt64(indexDouble)
        do {
            let result = try Sdk.decryptCiphertext(network: network, viewKey: viewKey, ciphertext: ciphertext, tpk: tpk, programId: programId, functionName: functionName, index: indexValue)
            promise.resolve(result)
        } catch {
            promise.reject("error", error.localizedDescription)
        }
    }

    AsyncFunction("decryptRecord") { (network: String, viewKey: String, recordCiphertext: String, promise: Promise) in
        do {
            let result = try Sdk.decryptRecord(network: network, viewKey: viewKey, recordCiphertext: recordCiphertext)
            promise.resolve(result)
        } catch {
            promise.reject("error", error.localizedDescription)
        }
    }

    AsyncFunction("decryptTransition") { (network: String, viewKey: String, transition: String, promise: Promise) in
        do {
            let result = try Sdk.decryptTransition(network: network, viewKey: viewKey, transition: transition)
            promise.resolve(result)
        } catch {
            promise.reject("error", error.localizedDescription)
        }
    }

    AsyncFunction("encryptRecord") { (network: String, viewKey: String, recordPlaintext: String, promise: Promise) in
        do {
            let result = try Sdk.encryptRecord(network: network, viewKey: viewKey, recordPlaintext: recordPlaintext)
            promise.resolve(result)
        } catch {
            promise.reject("error", error.localizedDescription)
        }
    }

    AsyncFunction("executeAuthorization") { (network: String, authorizationJson: String, feeAuthorizationJson: String, program: String, imports: String, function: String, restEndpoint: String, promise: Promise) in
        do {
            let result = try Sdk.executeAuthorization(network: network, authorizationJson: authorizationJson, feeAuthorizationJson: feeAuthorizationJson, program: program, imports: imports, function: function, restEndpoint: restEndpoint)
            promise.resolve(result)
        } catch {
            promise.reject("error", error.localizedDescription)
        }
    }

    AsyncFunction("fromSeedUnchecked") { (network: String, seed: String, promise: Promise) in
        guard let seedData = Data(base64Encoded: seed) else {
            promise.reject("error", "Invalid seed string")
            return
        }
        do {
            let result = try Sdk.fromSeedUnchecked(network: network, seed: seedData)
            promise.resolve(result)
        } catch {
            promise.reject("error", error.localizedDescription)
        }
    }

    AsyncFunction("isRecordOwner") { (network: String, viewKey: String, addressXCoordinate: String, recordNonce: String, recordOwnerXCoordinate: String, promise: Promise) in
        let result = Sdk.isRecordOwner(network: network, viewKey: viewKey, addressXCoordinate: addressXCoordinate, recordNonce: recordNonce, recordOwnerXCoordinate: recordOwnerXCoordinate)
        promise.resolve(result)
    }

    AsyncFunction("ownsTransition") { (network: String, viewKey: String, tpkStr: String, tcmStr: String, promise: Promise) in
        let result = Sdk.ownsTransition(network: network, viewKey: viewKey, tpkStr: tpkStr, tcmStr: tcmStr)
        promise.resolve(result)
    }

    AsyncFunction("privateKeyIsValid") { (network: String, privateKey: String, promise: Promise) in
        let result = Sdk.privateKeyIsValid(network: network, privateKey: privateKey)
        promise.resolve(result)
    }

    AsyncFunction("privateKeyNew") { (network: String, promise: Promise) in
        do {
            let result = try Sdk.privateKeyNew(network: network)
            promise.resolve(result)
        } catch {
            promise.reject("error", error.localizedDescription)
        }
    }

    AsyncFunction("privateKeyToAddress") { (network: String, privateKey: String, promise: Promise) in
        do {
            let result = try Sdk.privateKeyToAddress(network: network, privateKey: privateKey)
            promise.resolve(result)
        } catch {
            promise.reject("error", error.localizedDescription)
        }
    }

    AsyncFunction("privateKeyToViewKey") { (network: String, privateKey: String, promise: Promise) in
        do {
            let result = try Sdk.privateKeyToViewKey(network: network, privateKey: privateKey)
            promise.resolve(result)
        } catch {
            promise.reject("error", error.localizedDescription)
        }
    }

    AsyncFunction("programIsValid") { (network: String, program: String, promise: Promise) in
        let result = Sdk.programIsValid(network: network, program: program)
        promise.resolve(result)
    }

    AsyncFunction("programToId") { (network: String, program: String, promise: Promise) in
        do {
            let result = try Sdk.programToId(network: network, program: program)
            promise.resolve(result)
        } catch {
            promise.reject("error", error.localizedDescription)
        }
    }

    AsyncFunction("serialNumberString") { (network: String, recordPlaintext: String, privateKey: String, programId: String, recordName: String, promise: Promise) in
        do {
            let result = try Sdk.serialNumberString(network: network, recordPlaintext: recordPlaintext, privateKey: privateKey, programId: programId, recordName: recordName)
            promise.resolve(result)
        } catch {
            promise.reject("error", error.localizedDescription)
        }
    }

    AsyncFunction("sign") { (network: String, privateKey: String, message: String, promise: Promise) in
        guard let messageData = Data(base64Encoded: message) else {
            promise.reject("error", "Invalid message string")
            return
        }
        do {
            let result = try Sdk.sign(network: network, privateKey: privateKey, message: messageData)
            promise.resolve(result)
        } catch {
            promise.reject("error", error.localizedDescription)
        }
    }

    AsyncFunction("verify") { (network: String, signature: String, message: String, address: String, promise: Promise) in
        guard let messageData = Data(base64Encoded: message) else {
            promise.reject("error", "Invalid message string")
            return
        }
        let result = Sdk.verify(network: network, signature: signature, message: messageData, address: address)
        promise.resolve(result)
    }

    AsyncFunction("viewKeyIsValid") { (network: String, viewKey: String, promise: Promise) in
        let result = Sdk.viewKeyIsValid(network: network, viewKey: viewKey)
        promise.resolve(result)
    }

    AsyncFunction("viewKeyToAddress") { (network: String, viewKey: String, promise: Promise) in
        do {
            let result = try Sdk.viewKeyToAddress(network: network, viewKey: viewKey)
            promise.resolve(result)
        } catch {
            promise.reject("error", error.localizedDescription)
        }
    }
  }
}
