
import mongoose from "mongoose";
import { IFAQ } from "./faq.interface";
import FAQ from "./faq.model";

// Get all FAQs
const getFAQs = async (searchQuery?: string) => {
    const faqData = await FAQ.findOne();

    if (!faqData) {
        return [];
    }

    if (searchQuery) {
        const regex = new RegExp(searchQuery, "i"); // Case-insensitive search
        return faqData.faqs.filter((faq) => regex.test(faq.question));
    }

    return faqData.faqs;
};

// Add multiple FAQs at once
const addFAQ = async (faqs: IFAQ[]): Promise<IFAQ[]> => {
    let faqData = await FAQ.findOne();

    if (!faqData) {
        faqData = await FAQ.create({ faqs });
    } else {
        faqData.faqs.push(...faqs);
        await faqData.save();
    }

    return faqs; // Return the newly added FAQs


};

// Update an existing FAQ by _id
const updateFAQ = async (id: string, question: string, answer: string): Promise<IFAQ | null> => {
    const faqData = await FAQ.findOne();
    if (!faqData) {
        throw new Error("FAQ document not found");
    }

    const faq = faqData.faqs.find((faq) => faq._id?.toString() === id);
    if (!faq) {
        throw new Error("FAQ not found");
    }

    faq.question = question;
    faq.answer = answer;
    await faqData.save();

    return faq;
};

// Delete an FAQ by _id
const deleteFAQ = async (id: string) => {
    const faqData = await FAQ.findOne();
    if (!faqData) {
        throw new Error("FAQ document not found");
    }

    const filteredFAQs = faqData.faqs.filter((faq) => faq._id?.toString() !== id);
    if (filteredFAQs.length === faqData.faqs.length) {
        throw new Error("FAQ not found");
    }

    faqData.faqs = filteredFAQs;
    await faqData.save();
    return null;
};

export const faqService = {
    getFAQs,
    addFAQ,
    updateFAQ,
    deleteFAQ,
};
