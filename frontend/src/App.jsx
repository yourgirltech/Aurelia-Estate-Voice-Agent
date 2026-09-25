import { useState } from "react";
import SplitLayout from "./components/SplitLayout.jsx";
import EnquiryForm from "./components/EnquiryForm.jsx";
import ThankYou from "./components/ThankYou.jsx";
import TalkToPrecious from "./components/TalkToPrecious.jsx";
import TalkToPreciousPill from "./components/TalkToPreciousPill.jsx";
import { usePreciousCall } from "./lib/usePreciousCall.js";
import { COMPANY } from "./config/company.js";

export default function App() {
  const [result, setResult] = useState(null);
  const [aboutYou, setAboutYou] = useState(null);
  const preciousCall = usePreciousCall(aboutYou);

  return (
    <SplitLayout preciousCall={preciousCall}>
      <TalkToPrecious preciousCall={preciousCall} variant="mobile" className="lg:hidden mb-6" />

      {result ? (
        <ThankYou salutation={result.salutation} language={result.language} />
      ) : (
        <EnquiryForm onSubmitted={setResult} onAboutYouComplete={setAboutYou} />
      )}

      <p className="text-center text-xs text-brand/40 mt-6">
        © {new Date().getFullYear()} {COMPANY.name}
      </p>

      <TalkToPreciousPill preciousCall={preciousCall} />
    </SplitLayout>
  );
}
