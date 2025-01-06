'use client'

import {Button} from "@/components/ui/button";
import { useFormStatus } from "react-dom"
import {IoReload} from "react-icons/io5";

type SubmitButtonProps = {
    className?: string;
    text?: string;
}

export function SubmitButton({className='', text='submit'}: SubmitButtonProps) {
    const {pending} = useFormStatus()

    return <Button type='submit' disabled={pending} className={`capitalize ${className}`} size='lg'>
        {pending? <>
            <IoReload className={'mr-2 h-4 w-4 animate-spin'} />
            Please wait...
        </>: text}
    </Button>
}