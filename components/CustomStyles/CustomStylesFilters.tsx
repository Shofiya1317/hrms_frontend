/* eslint-disable @typescript-eslint/no-explicit-any */

import { CSSObjectWithLabel } from 'react-select';

type CustomStylesProps = {
  isFocused: boolean;
  isSelected: boolean;
};

const CustomStyles = {
  control: (provided: CSSObjectWithLabel, state: any) => ({
    ...provided,
    width: '100%',
    minHeight: '40px',
    borderRadius: '8px',
    border: '1px solid #E4E7EC',
    backgroundColor: state.isDisabled ? '#F9F9F980' : '#ffffff',
    boxShadow: 'none',
    cursor: 'pointer',
    paddingRight: 0,
    '&:hover': {
      borderColor: '#E4E7EC',
    },
  }),

  option: (
    provided: CSSObjectWithLabel,
    { isFocused, isSelected }: CustomStylesProps,
  ) => {
    let backgroundColor = '#ffffff';
    let color = '#64656D';

    if (isSelected) {
      backgroundColor = '#fba900';
      color = '#ffffff';
    } else if (isFocused) {
      backgroundColor = '#e9eaed';
      color = '#fba900';
    }

    return {
      ...provided,
      backgroundColor,
      color,
      cursor: 'pointer',
      fontSize: '14px',
    };
  },

  menu: (provided: any) => ({
    ...provided,
    maxHeight: '180px',
    borderRadius: '7px',
    marginTop: 4,
    overflow: 'hidden',
  }),

  menuList: (provided: any) => ({
    ...provided,
    maxHeight: '120px',
    overflowY: 'auto',
    padding: 0,
  }),

  singleValue: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: '#64656D',
    fontSize: '14px',
  }),

  placeholder: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: '#64656D',
    fontSize: '12px',
  }),

  dropdownIndicator: (provided: CSSObjectWithLabel) => ({
    ...provided,
    padding: '5px',
    color: '#ACACAC',
  }),

  indicatorSeparator: (provided: CSSObjectWithLabel) => ({
    ...provided,
    backgroundColor: '#E4E7EC',
    width: '1px',
    height: '20px',
    alignSelf: 'center',
  }),

  multiValue: (provided: CSSObjectWithLabel) => ({
    ...provided,
    // backgroundColor: '#FBA9001A',
    borderRadius: '6px',
    paddingLeft: '2px',
  }),

  multiValueLabel: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: '#1E1E1E',
    fontSize: '12px',
    fontWeight: 500,
  }),

  multiValueRemove: (provided: CSSObjectWithLabel) => ({
    ...provided,
    // color: '#FBA900',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#FBA900',
      color: '#ffffff',
    },
  }),

  // clearIndicator: (provided: CSSObjectWithLabel) => ({
  //   ...provided,
  //   cursor: 'pointer',
  //   padding: '4px',
  // }),
};

export default CustomStyles;
