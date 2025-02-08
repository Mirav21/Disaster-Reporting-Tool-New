import React from "react";
import { Phone } from "lucide-react";

const EmergencySection = () => {
  const emergencyContacts = [
    {
      category: "",
      icon: <></>,
      bgColor: "",
      borderColor: "",
      numbers: [
        { name: "", number: "", icon: <></> },
        { name: "", number: "", icon: <></> },
        { name: "", number: "", icon: <></> },
      ],
    },
    {
      category: "Emergency Services",
      icon: <Phone className="h-6 w-6 text-red-600 dark:text-red-500" />,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-500/20",
      numbers: [
        {
          name: "Earthquake Helpline",
          number: "192",
          icon: <Phone className="h-6 w-6 text-red-600 dark:text-red-500" />,
        },
        {
          name: "National Disaster Management Authority",
          number: "+91 7923259283",
          icon: <Phone className="h-6 w-6 text-red-600 dark:text-red-500" />,
        },
        {
          name: "Unified Emergency Number",
          number: "112",
          icon: <Phone className="h-6 w-6 text-red-600 dark:text-red-500" />,
        },
        {
          name: "Ambulance",
          number: "108",
          icon: <Phone className="h-6 w-6 text-red-600 dark:text-red-500" />,
        },
        {
          name: "Fire Department",
          number: "101",
          icon: <Phone className="h-6 w-6 text-red-600 dark:text-red-500" />,
        },
      ],
    },
    {
      category: "",
      icon: <></>,
      bgColor: "",
      borderColor: "",
      numbers: [
        { name: "", number: "", icon: <></> },
        { name: "", number: "", icon: <></> },
        { name: "", number: "", icon: <></> },
      ],
    },
  ];

  return (
    <section className="mt-24 text-center">
      <h2 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-white">
        Emergency Helpline Numbers
      </h2>
      <div className="hidden md:grid lg:grid grid-cols-1 md:grid-cols-3 gap-6">
        {emergencyContacts.map((category, index) => (
          <div key={index} className={`rounded-2xl p-6 ${category.bgColor}`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              {category.icon}
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                {category.category}
              </h3>
            </div>
            <div className="space-y-3">
              {category.numbers.map((item, idx) => (
                <a
                  key={idx}
                  href={`tel:${item.number}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 transition-colors"
                >
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
                    {item.number} {item.icon}
                    {/* <Phone className="h-4 w-4" /> */}
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="grid md:hidden lg:hidden grid-cols-1 md:grid-cols-3 gap-6">
        {emergencyContacts.map(
          (category, index) =>
            index === 1 && (
              <div
                key={index}
                className={`rounded-2xl p-6 ${category.bgColor}`}
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  {category.icon}
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    {category.category}
                  </h3>
                </div>
                <div className="space-y-3">
                  {category.numbers.map((item, idx) => (
                    <a
                      key={idx}
                      href={`tel:${item.number}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 transition-colors"
                    >
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
                        {item.number} {item.icon}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )
        )}
      </div>
    </section>
  );
};

export default EmergencySection;
