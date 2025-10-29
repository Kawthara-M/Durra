import React from "react";
import '../../public/stylesheets/Terms.css';

const TermsAndConditions = () => {
  const sections = [
    { title: "Introduction", content: "Welcome to our website. By accessing or using our services, you agree to comply with and be bound by these terms and conditions." },
    { title: "Use of Website", content: "You agree to use the website for lawful purposes only. Any unauthorized use of the website is prohibited." },
    { title: "Products and Services", content: "We strive to ensure all product descriptions are accurate. Prices and availability may change without prior notice." },
    { title: "Privacy & Security", content: "We respect your privacy. Any personal information collected is protected under our Privacy Policy." },
    { title: "Limitation of Liability", content: "We are not liable for any indirect or consequential losses arising from the use of our website or products." },
    { title: "Governing Law", content: "These terms are governed by the laws of Bahrain. By using our website, you consent to jurisdiction in Bahraini courts." },
    { title: "Contact Us", content: <>If you have any questions regarding these terms, please visit our <a href="/contact" className="tc-link">Contact Page</a>.</> },
    { title: "Partner Policy", content: "For our partners who wish to join and sell their products on our platform: You are responsible for providing accurate and truthful information about every product you submit. All products must be added by you, and our administrative team will review and approve them before they are published on the website. By submitting products, you agree to comply with this policy and ensure the authenticity and quality of each item.", highlight: true }
  ];

  return (
    <div className="tc-page">
      <div className="tc-container">

        {/* Hero Section */}
        <section className="tc-hero">
          <h1 className="tc-hero-title">Terms & Conditions</h1>
          <p className="tc-hero-subtitle">..</p>
        </section>

        {/* Timeline Sections */}
        <section className="tc-timeline">
          {sections.map((sec, idx) => (
            <div key={idx} className={`tc-timeline-item ${sec.highlight ? "highlight" : ""}`}>
              <div className="tc-timeline-number">{idx + 1}</div>
              <div className="tc-timeline-content">
                <h2>{sec.title}</h2>
                <p>{sec.content}</p>
              </div>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
};

export default TermsAndConditions;
