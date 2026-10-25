import nextConfig from "eslint-config-next/core-web-vitals";
import { globalIgnores } from "eslint/config";

const eslintConfig = [
    ...nextConfig,
    globalIgnores([".next-playwright/**"]),
    {
        rules: {
            "react-hooks/set-state-in-effect": "off",
        },
    },
];

export default eslintConfig;
