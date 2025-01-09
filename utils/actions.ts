'use server'

import db from './db';
import {profileSchema} from "@/utils/schemas";
import {clerkClient, currentUser} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";

const getAuthUser = async() => {
    const user = await currentUser();
    if(!user) throw new Error("You must be logged in to acces this route");
    if(!user.privateMetadata.hasProfile) redirect('/profile/create');
    return user;
}

export const createProfileAction = async (prevState: any, formData:FormData) => {

    try {
        const user = await currentUser();
        if(!user) throw new Error("Please log in to create a profile.");

        const rawData = Object.fromEntries(formData);
        const validatedFields = profileSchema.parse(rawData);
        await db.profile.create({
            data : {
                clerkId: user.id,
                email: user.emailAddresses[0].emailAddress,
                profileImage: user.imageUrl ?? '',
                ...validatedFields,
            }
        });
        await clerkClient.users.updateUserMetadata(user.id, {
            privateMetadata: {
                hasProfile: true,
            }
        })
    } catch (error) {
        return {message: error instanceof Error ? error.message : 'An error ocured!'};
    }
    redirect('/');

}

export const fetchProfileImage = async () => {
    const user = await currentUser();
    if(!user) throw new Error("Please log in to fetch a profile.");

    const profile = await db.profile.findUnique({
        where : {
            clerkId: user.id,
        },
        select: {
            profileImage: true,
        }
    });

    return profile?.profileImage;
}

export const fetchProfile = async () => {
    const user = await getAuthUser();
    const profile = await db.profile.findUnique({
        where: {
            clerkId: user.id,
        }
    })
}