import { useState } from "react";
import SplitLayout from "./components/SplitLayout.jsx";
import EnquiryForm from "./components/EnquiryForm.jsx";
import ThankYou from "./components/ThankYou.jsx";
import TalkToAda from "./components/TalkToAda.jsx";
import TalkToAdaPill from "./components/TalkToAdaPill.jsx";
import { useAdaCall } from "./lib/useAdaCall.js";
import { COMPANY } from "./config/company.js";

export default function App() {
  const [result, setResult] = useState(null);
  const [aboutYou, setAboutYou] = useState(null);
  const adaCall = useAdaCall(aboutYou);

  return (
    <SplitLayout adaCall={adaCall}>
      <TalkToAda adaCall={adaCall} variant="mobile" className="lg:hidden mb-6" />

      {result ? (
        <ThankYou salutation={result.salutation} language={result.language} />
      ) : (
        <EnquiryForm onSubmitted={setResult} onAboutYouComplete={setAboutYou} />
      )}

      <p className="text-center text-xs text-brand/40 mt-6">
        © {new Date().getFullYear()} {COMPANY.name}
      </p>

      <TalkToAdaPill adaCall={adaCall} />
    </SplitLayout>
  );
}
