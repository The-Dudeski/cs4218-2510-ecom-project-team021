import React from "react";
import Layout from "./../components/Layout";

const Policy = () => {
  const policies = [
    "We value your privacy and protect your personal information.",
    "Your data is used only to process orders and improve your experience.",
    "Payments are handled securely — we don’t store card details.",
    "You can contact us anytime to update or remove your information.",
  ];
  return (
    <Layout title={"Privacy Policy"}>
      <div className="row contactus ">
        <div className="col-md-6 ">
          <img
            src="/images/contactus.jpeg"
            alt="Privacy"
            style={{ width: "100%" }}
          />
        </div>
        <div className="col-md-6 col-sm-12">
          <h2 className="mb-3">Privacy Policy</h2>
          {policies.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Policy;