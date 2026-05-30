import BloodAppealWebForm from '../../../components/BloodAppealWebForm';

export default function PatientBloodAppealPage() {
  return (
    <BloodAppealWebForm
      backHref="/patient"
      title="Blood Appeal"
      subtitle="Request blood donation from nearby donors and blood banks."
    />
  );
}
