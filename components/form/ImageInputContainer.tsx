'use client'

import React, {useState} from 'react'
import {actionFunction} from "@/utils/types";
import {LucideUser2} from "lucide-react";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import FormContainer from "@/components/form/FormContainer";
import ImageInput from "@/components/form/ImageInput";
import {SubmitButton} from "@/components/form/Buttons";

type ImageInputContainerProps = {
    image: string;
    name: string;
    action: actionFunction;
    text: string;
    children?: React.ReactNode;
}

function ImageInputContainer(props : ImageInputContainerProps) {
    const {image, name, action, text} = props;
    const [isUpdateFormVisible, setIsUpdateFormVisible] = useState(false);

    const userIcon = <LucideUser2 className='w-24 h-24 bg-primary rounded text-white mb-4' />
    return (
        <div>
            {image ? <Image src={image} alt={name} width={100} height={100} className='rounded object-cover mb-4 w-24 h-24'/> : userIcon}
            <Button variant='outline' size='sm' onClick={() => setIsUpdateFormVisible((prev) => !prev)}>
                {text}
            </Button>
            {isUpdateFormVisible && <div className='max-w-lg mt-4'>
                <FormContainer action={action}>
                    {props.children}
                    <ImageInput />
                    <SubmitButton size='sm' />
                </FormContainer>
            </div>}
        </div>
    )
}

export default ImageInputContainer
