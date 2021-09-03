import dotenv from 'dotenv';
dotenv.config();

const config = () => {
  return {
    bd_string: `mongodb+srv://holisticad:${process.env.passMongo}@holistic-ireland.mnjpf.mongodb.net/MarketPlace?retryWrites=true&w=majority`,
    jwt_pass: "batatafrita2019",
    jwt_expires_in: "7d",
  };
};

export default config();
