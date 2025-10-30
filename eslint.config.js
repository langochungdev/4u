import vueParser from 'vue-eslint-parser';
import vuePlugin from 'eslint-plugin-vue';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
export default[
  {
    files:["**/*.vue"],
    languageOptions:{parser:vueParser,parserOptions:{parser:{ts:tsParser},ecmaVersion:'latest',sourceType:'module'}},
    plugins:{vue:vuePlugin},
    rules:{'vue/script-setup-uses-vars':1,'vue/no-unused-vars':1,'vue/no-template-shadow':0,'vue/no-unused-components':0,'vue/no-template-target-blank':0}
  },
  {
    files:["**/*.ts"],
    languageOptions:{parser:tsParser,ecmaVersion:'latest',sourceType:'module'},
    plugins:{'@typescript-eslint':tsPlugin},
    rules:{'@typescript-eslint/ban-ts-comment':0}
  }
]
