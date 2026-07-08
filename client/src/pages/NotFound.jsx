import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <div className="receipt-paper receipt-shadow w-full max-w-md p-8 relative">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold uppercase tracking-widest">GO DUTCH</h1>
        </div>
        
        <hr className="receipt-separator" />
        
        <div className="my-8 text-center">
          <h2 className="text-2xl font-bold uppercase mb-4">RECEIPT NOT FOUND</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-6">
            We couldn't find this expense group.
          </p>
          <div className="text-left text-sm text-gray-700">
            <p className="font-bold uppercase mb-2">Possible reasons:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>The receipt link is incorrect.</li>
              <li>The group has been deleted.</li>
              <li>The receipt has expired.</li>
            </ul>
          </div>
        </div>
        
        <hr className="receipt-separator" />
        
        <div className="mt-8 text-center">
          <Link to="/">
            <Button className="w-full">Return Home</Button>
          </Link>
        </div>
        
        <div className="mt-10 text-center">
          <hr className="receipt-separator" />
          <p className="text-sm uppercase tracking-wider mt-4 font-bold">
            THANK YOU FOR GOING DUTCH
          </p>
        </div>
      </div>
    </div>
  );
}
