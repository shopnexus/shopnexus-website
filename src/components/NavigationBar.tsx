import { useState, useEffect, useRef } from "react";
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from "react-icons/vsc";
import { CiShoppingCart } from "react-icons/ci";
import Dock from "../blocks/Components/Dock/Dock";

const NavigationBar = () => {
    const [visibility, setVisibility] = useState("full");
    const lastScrollY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (isHovered) return; // Khi đang hover, không thay đổi trạng thái

            if (window.scrollY > lastScrollY.current) {
                setVisibility("hidden");
            } else if (window.scrollY < lastScrollY.current) {
                setVisibility("three-quarters");
            }

            lastScrollY.current = window.scrollY;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isHovered]);

    const items = [
        { icon: <VscHome size={18} className="text-white" />, label: "Home", onClick: () => alert("Home!") },
        { icon: <VscArchive size={18} className="text-white" />, label: "Archive", onClick: () => alert("Archive!") },
        { icon: <VscAccount size={18} className="text-white" />, label: "Profile", onClick: () => alert("Profile!") },
        { icon: <VscSettingsGear size={18} className="text-white" />, label: "Settings", onClick: () => alert("Settings!") },
        { icon: <CiShoppingCart size={18} className="text-white" />, label: "Your Cart", onClick: () => alert("Your Cart") },
    ];

    return (
        <>
            {/* Trigger để hiển thị full navbar khi di chuột vào */}
            <div
                className="fixed bottom-0 left-0 right-0 h-5 z-100"
                onMouseEnter={() => {
                    setVisibility("full");
                    setIsHovered(true);
                }}
                onMouseLeave={() => setIsHovered(false)}
            />

            {/* Thanh navbar */}
            <div
                className={`fixed bottom-0 left-0 right-0 transition-transform duration-300
                    ${visibility === "hidden" ? "translate-y-full" : ""}
                    ${visibility === "three-quarters" ? "translate-y-6/7" : ""}
                    ${visibility === "full" ? "translate-y-0" : ""}`}
                onMouseLeave={() => !isHovered && setVisibility("three-quarters")}
            >
                <Dock
                    items={items}
                    panelHeight={68}
                    baseItemSize={50}
                    magnification={70}
                    className="bg-white shadow-md"
                />
            </div>
        </>
    );
};

export default NavigationBar;
