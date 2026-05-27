/* eslint-disable @typescript-eslint/no-explicit-any */

import { CSSObjectWithLabel } from 'react-select';

type CustomStylesProps = {
  isFocused: boolean;
  isSelected: boolean;
};

const theme = {
  primary: '#163B45',
  accent: '#0F766E',
  accentSoft: '#E5F2EF',
  border: '#D9E3E2',
  borderHover: '#9FC7C0',
  surface: '#FFFFFF',
  mutedSurface: '#F8FAFC',
  disabled: '#F1F5F4',
  text: '#334155',
  textMuted: '#64748B',
  placeholder: '#94A3B8',
};

const CustomStyles = {
  control: (provided: CSSObjectWithLabel, state: any) => ({
    ...provided,
    width: '100%',
    minHeight: '40px',
    borderRadius: '8px',
    border: `1px solid ${state.isFocused ? theme.accent : theme.border}`,
    backgroundColor: state.isDisabled ? theme.disabled : theme.surface,
    boxShadow: state.isFocused ? '0 0 0 3px rgba(15, 118, 110, 0.1)' : 'none',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    paddingRight: 0,
    '&:hover': {
      borderColor: state.isDisabled ? theme.border : theme.borderHover,
    },
  }),

  option: (
    provided: CSSObjectWithLabel,
    { isFocused, isSelected }: CustomStylesProps,
  ) => {
    let backgroundColor = theme.surface;
    let color = theme.text;

    if (isSelected) {
      backgroundColor = theme.accent;
      color = '#ffffff';
    } else if (isFocused) {
      backgroundColor = theme.accentSoft;
      color = theme.accent;
    }

    return {
      ...provided,
      backgroundColor,
      color,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: isSelected ? 600 : 500,
      ':active': {
        backgroundColor: theme.accent,
        color: '#ffffff',
      },
    };
  },

  menu: (provided: any) => ({
    ...provided,
    maxHeight: '180px',
    borderRadius: '8px',
    marginTop: 4,
    overflow: 'hidden',
    border: `1px solid ${theme.border}`,
    boxShadow: '0 14px 35px rgba(15, 23, 42, 0.12)',
    zIndex: 20,
  }),

  menuList: (provided: any) => ({
    ...provided,
    maxHeight: '120px',
    overflowY: 'auto',
    padding: 0,
  }),

  singleValue: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: theme.text,
    fontSize: '14px',
    fontWeight: 500,
  }),

  placeholder: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: theme.placeholder,
    fontSize: '12px',
  }),

  dropdownIndicator: (provided: CSSObjectWithLabel) => ({
    ...provided,
    padding: '5px',
    color: theme.textMuted,
  }),

  indicatorSeparator: (provided: CSSObjectWithLabel) => ({
    ...provided,
    backgroundColor: theme.border,
    width: '1px',
    height: '20px',
    alignSelf: 'center',
  }),

  multiValue: (provided: CSSObjectWithLabel) => ({
    ...provided,
    backgroundColor: theme.accentSoft,
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    paddingLeft: '2px',
  }),

  multiValueLabel: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: theme.accent,
    fontSize: '12px',
    fontWeight: 600,
  }),

  multiValueRemove: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: theme.textMuted,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: theme.accent,
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
