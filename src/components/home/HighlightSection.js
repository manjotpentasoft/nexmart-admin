import "../../styles/home/HighlightsSection.css"; 
import { FaTruck, FaSmile, FaHandsHelping, FaCar, FaHeadset } from "react-icons/fa";

const highlights = [
  { icon: <FaTruck />, text: "Same day Delivery" },
  { icon: <FaSmile />, text: "100% Customer Satisfaction" },
  { icon: <FaHandsHelping />, text: "Help and access is our mission" },
  { icon: <FaCar />, text: "100% quality Accessories" },
  { icon: <FaHeadset />, text: "24/7 Support for Clients" },
];

const HighlightsSection = () => {
  return (
    <section className="highlights-section inner-highlights">
      <div className="large-container">
        <div className="inner-container clearfix">
          <div
            className="shape"
            style={{
              backgroundImage: `url(assets/images/shape/shape-5.png)`,
            }}
          ></div>

          {highlights.map((item, index) => (
            <div className="highlights-block-one" key={index}>
              <div className="inner-box">
                <div className="icon-box">
                  {item.icon}
                </div>
                <h5>{item.text}</h5>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HighlightsSection;
