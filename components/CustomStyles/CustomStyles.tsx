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
  accentHover: '#F3F8F6',
  gold: '#D79A2B',
  border: '#D9E3E2',
  borderHover: '#9FC7C0',
  surface: '#FFFFFF',
  mutedSurface: '#F8FAFC',
  disabled: '#F1F5F4',
  text: '#334155',
  textMuted: '#64748B',
  placeholder: '#94A3B8',
};

const customStyles = (showSeparator = false) => ({
  control: (provided: CSSObjectWithLabel, state: any) => ({
    ...provided,
    width: '100%',
    minHeight: '40px',
    borderRadius: '8px',
    border: state.isDisabled
      ? `1px solid ${theme.border}`
      : `1px solid ${state.isFocused ? theme.accent : theme.border}`,
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
      fontSize: '13px',
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
    fontSize: '13px',
    fontWeight: 500,
  }),

  placeholder: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: theme.placeholder,
    fontSize: '12px',
  }),

  dropdownIndicator: () => ({
    padding: '5px',
    color: theme.textMuted,
  }),

  indicatorSeparator: () => (showSeparator
    ? { backgroundColor: theme.border, width: '1px' }
    : { display: 'none' }),

  multiValue: (provided: CSSObjectWithLabel) => ({
    ...provided,
    backgroundColor: theme.accentSoft,
    border: `1px solid ${theme.border}`,
    borderRadius: '60px',
    paddingLeft: '4px',
  }),

  multiValueLabel: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: theme.accent,
    fontSize: '12px',
    fontWeight: 600,
    padding: '2px 6px',
  }),

  multiValueRemove: (provided: CSSObjectWithLabel) => ({
    ...provided,
    borderRadius: '60px',
    color: theme.textMuted,
    ':hover': {
      backgroundColor: theme.accent,
      color: '#ffffff',
    },
  }),
});

export default customStyles;
