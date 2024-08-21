import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'style/brace-style': ['error', '1tbs', {
      allowSingleLine: false,
    }],
    'curly': ['error', 'all'],
    'style/arrow-parens': ['error', 'as-needed', {
      requireForBlockBody: false,
    }],
    'style/multiline-ternary': 'off',
  },
})
