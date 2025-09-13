"use client";

import { useParams, useRouter } from 'next/navigation';
import { LayersWorkflow } from '../../../components/workflows/LayersWorkflow';
import { VocalsWorkflow } from '../../../components/workflows/VocalsWorkflow';
import { DescribeWorkflow } from '../../../components/workflows/DescribeWorkflow';
import { RemixWorkflow } from '../../../components/workflows/RemixWorkflow';

export default function WorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const workflowType = params.type as string;

  const handleBack = () => {
    router.push('/');
  };

  const renderWorkflow = () => {
    switch (workflowType) {
      case 'layers':
        return <LayersWorkflow onBack={handleBack} />;
      case 'vocals':
        return <VocalsWorkflow onBack={handleBack} />;
      case 'describe':
        return <DescribeWorkflow onBack={handleBack} />;
      case 'remix':
        return <RemixWorkflow onBack={handleBack} />;
      default:
        return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Workflow Not Found</h1>
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        );
    }
  };

  return renderWorkflow();
}