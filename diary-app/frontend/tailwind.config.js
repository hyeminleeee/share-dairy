/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          50:  "#fffafc",
          100: "#fff0f7",   // 그라데이션 끝
          200: "#fdddf0",   // 그라데이션 시작 / 연한 배경
          300: "#f9c5dc",
          400: "#f4a7c9",   // 메인 버튼 배경
          500: "#ee8cba",   // 메인 버튼 hover
          600: "#e87db0",   // 포인트 컬러 (링크, 아이콘)
          700: "#d4689c",
          800: "#c45c8a",   // 텍스트 강조
          900: "#9e3d6a",
        },
      },
      backgroundImage: {
        "spring": "linear-gradient(to bottom, #fdddf0, #fff0f7)",
      },
    },
  },
  plugins: [],
};
