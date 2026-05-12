/* eslint-disable @typescript-eslint/no-explicit-any */

import { UserService } from '@/lib/service';
import { useCallback, useEffect, useState } from 'react';
import {
  GroupBase,
  MultiValue,
  OptionsOrGroups,
  SingleValue,
} from 'react-select';
import AsyncSelect from 'react-select/async';
import CustomStyles from '../CustomStyles/CustomStyles';
import { useUser } from '../Context/userProvider';
import { Option } from '../types';

interface SectorSelectProps {
  slug: string;
  isMulti?: boolean;
  value?: string[];
  onChange: (option: Option | Option[]) => void;
  isDisabled?: boolean;
  placeholder?: string;
  actionTypes?: string;
  token: string;
}

export default function SectorSelect({
  isMulti = false,
  value,
  onChange,
  isDisabled = false,
  placeholder = 'Select Sector',
  actionTypes = 'ACTIVE',
  slug,
  token,
}: SectorSelectProps) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<
    OptionsOrGroups<Option, GroupBase<Option>>
  >([]);
  const context = useUser();

  const loadOptions = useCallback(
    async (
      input: string,
    ): Promise<OptionsOrGroups<Option, GroupBase<Option>>> => {
      try {
        const accessToken = token || context?.currentUser?.accessToken;
        const tenantSlug = slug || context?.currentUser?.account?.slug;

        const filter = {
          search: input || undefined,
          limit: 1000,
        };

        const res = await UserService.getSectorList(filter, tenantSlug, accessToken);

        const sectors = res.data?.sectors || res.data || [];

        if (!Array.isArray(sectors)) return [];

        return sectors
          .filter((sector) => (actionTypes === 'ACTIVE' ? sector.status === 'ACTIVE' : true))
          .map((sector) => ({
            label: sector.name,
            value: sector.id,
            isDisabled: sector.status === 'INACTIVE',
          }));
      } catch (error) {
        // console.error('Failed to load sectors', error);
        return [];
      }
    },
    [actionTypes, token, slug, context],
  );

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    loadOptions('').then((options: any) => {
      setOptions(options as OptionsOrGroups<Option, GroupBase<Option>>);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (newValue: MultiValue<Option> | SingleValue<Option>) => {
    if (isMulti) {
      onChange(newValue as Option[]);
    } else {
      onChange(newValue as Option);
    }
  };

  const getValues = () => {
    if (isMulti) {
      return options
        .filter((opt): opt is Option => !('options' in opt))
        .filter((item) => value?.includes(item?.value));
    }
    return options
      .filter((opt): opt is Option => !('options' in opt))
      .find((item) => value?.includes(item?.value));
  };

  return (
    <AsyncSelect
      isMulti={isMulti}
      value={getValues()}
      onChange={handleChange}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onInputChange={(newValue: any) => {
        setInputValue(newValue);
      }}
      defaultOptions={options}
      placeholder={placeholder}
      isDisabled={isDisabled}
      loadOptions={loadOptions}
      inputValue={inputValue}
      styles={CustomStyles(false)}
      isClearable={false}
      classNamePrefix="custom_select_input"
    />
  );
}
