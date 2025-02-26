import PrivacyPolicy, { IPrivacyPolicy } from "./privacyPolicy.model";


// Get the latest privacy policy
const getPrivacyPolicy = async (): Promise<IPrivacyPolicy | null> => {
    return await PrivacyPolicy.findOne().sort({ createdAt: -1 });
};

// Create or update the privacy policy
const updatePrivacyPolicy = async (content: string): Promise<IPrivacyPolicy> => {
    let policy = await PrivacyPolicy.findOne();
    if (!policy) {
        policy = new PrivacyPolicy({ content });
    } else {
        policy.content = content;
    }
    return await policy.save();
};

export const privacyPolicyService = {
    getPrivacyPolicy,
    updatePrivacyPolicy,
};
