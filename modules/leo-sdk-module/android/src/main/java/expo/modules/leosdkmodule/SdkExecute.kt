package expo.modules.leosdkmodule

object SdkExecute {
    init {
        // Assuming the .so file is loaded from one of the directories within rustJniLibs/android based on the ABI.
        System.loadLibrary("sdk") // The name without the 'lib' prefix and '.so' extension
    }

    // Declare the native method that matches the Rust function signature
    external fun executeAuthorization(
        network: String,
        authorizationJson: String,
        feeAuthorizationJson: String?,
        program: String,
        imports: String?,
        function: String,
        restEndpoint: String
    ): String

    // You can also add a wrapper function to handle the nullable String parameters, if needed
    fun executeAuth(
        network: String,
        authorizationJson: String,
        feeAuthorizationJson: String?,
        program: String,
        imports: String?,
        function: String,
        restEndpoint: String
    ): String {
        // Call the external function, converting nulls to empty strings if that's appropriate for your use case
        return executeAuthorization(
            network,
            authorizationJson,
            feeAuthorizationJson.orEmpty(),
            program,
            imports.orEmpty(),
            function,
            restEndpoint
        )
    }
}