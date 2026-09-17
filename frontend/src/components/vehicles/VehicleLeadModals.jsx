import Modal from '../common/Modal'
import EnquiryForm from './EnquiryForm'
import FinanceForm from './FinanceForm'
import TestDriveForm from './TestDriveForm'

/**
 * The three ways a customer can start a conversation about a vehicle,
 * described once.
 *
 * A table rather than three near-identical `<Modal>` blocks: the dialogs differ
 * only in their heading and which form they hold, and three copies of the same
 * wrapper is where a size or a `size` prop drifts out of step with the others.
 */
const DIALOGS = {
  enquiry: {
    title: 'Ask about this vehicle',
    description: 'Send us a question and we will reply within one business day.',
    Form: EnquiryForm,
  },
  'test-drive': {
    title: 'Book a test drive',
    description: 'Pick a day and time that suits you and we will have it ready.',
    Form: TestDriveForm,
  },
  finance: {
    title: 'Get pre-approved',
    description: 'Tell us what you have in mind and we will go over your options.',
    Form: FinanceForm,
  },
}

export default function VehicleLeadModals({ vehicle, intent, onClose }) {
  const config = DIALOGS[intent]
  const Form = config?.Form

  return (
    <Modal
      open={Boolean(config)}
      onClose={onClose}
      title={config?.title}
      description={config?.description}
      size="lg"
    >
      {Form && <Form vehicle={vehicle} onDone={onClose} />}
    </Modal>
  )
}
