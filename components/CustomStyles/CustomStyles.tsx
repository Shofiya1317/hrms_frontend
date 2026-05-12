/* eslint-disable @typescript-eslint/no-explicit-any */

import { CSSObjectWithLabel } from 'react-select';

type CustomStylesProps = {
  isFocused: boolean;
  isSelected: boolean;
};

const customStyles = (showSeparator = false) => ({
  control: (provided: CSSObjectWithLabel, state: any) => ({
    ...provided,
    width: '100%',
    minHeight: '40px',
    borderRadius: '8px',
    border: state.isDisabled ? '1px solid #E4E7EC' : '1px solid #ACACAC',
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
      fontSize: '13px',
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
    fontSize: '13px',
  }),

  placeholder: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: '#64656D',
    fontSize: '12px',
  }),

  dropdownIndicator: () => ({
    padding: '5px',
    color: '#ACACAC',
  }),

  indicatorSeparator: () => (showSeparator
    ? { backgroundColor: '#E4E7EC', width: '1px' }
    : { display: 'none' }),

  multiValue: (provided: CSSObjectWithLabel) => ({
    ...provided,
    backgroundColor: '#F9F9F9',
    border: '1px solid #E4E7EC',
    borderRadius: '60px',
    paddingLeft: '4px',
  }),

  multiValueLabel: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: '#64656D',
    fontSize: '12px',
    padding: '2px 6px',
  }),

  multiValueRemove: (provided: CSSObjectWithLabel) => ({
    ...provided,
    borderRadius: '60px',
    color: '#98A2B3',
    ':hover': {
      backgroundColor: '#EEF2F6',
      color: '#344054',
    },
  }),
});

export default customStyles;
