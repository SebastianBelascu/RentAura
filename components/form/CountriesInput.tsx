import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {Label} from "@/components/ui/label";
import {formattedCountries} from "@/utils/countries";

const name = 'country';

function CountriesInput({defaultValue}: {defaultValue?: string}) {
    return (
        <div className='mb-2'>
            <Label htmlFor={name} className='capitalize'>
                country
            </Label>

            <Select defaultValue={defaultValue || formattedCountries[0].code} name={name} required>
                <SelectTrigger>
                    <SelectValue></SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {formattedCountries.map(country => {
                        return <SelectItem key={country.code} value={country.code}>
                            <span className='flex items-center gap-2'>
                                {country.flag} {country.name}
                            </span>
                        </SelectItem>
                    })}
                </SelectContent>
            </Select>
        </div>
    )
}

export default CountriesInput
