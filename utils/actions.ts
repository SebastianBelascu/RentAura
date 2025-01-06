'use server'

import {profileSchema} from "@/utils/schemas";

export const createProfileAction = async (prevState: any, formData:FormData) => {

    try {
        const rawData = Object.fromEntries(formData);
        const validatedFields = profileSchema.parse(rawData);
        return { message: 'Profile created!'}
    } catch (error) {
        console.log(error);
        return {message: 'there was an error'};
    }

}