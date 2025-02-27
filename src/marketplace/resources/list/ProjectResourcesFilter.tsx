import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';

import { OfferingFilter } from './OfferingFilter';
import { OfferingChoice } from './types';

interface OwnProps {
  offerings: OfferingChoice[];
}

interface FormData {
  offering: OfferingChoice;
}

const PureProjectResourcesFilter = ({ offerings }) => (
  <Row>
    <OfferingFilter options={offerings} />
  </Row>
);

export const ProjectResourcesFilter = reduxForm<FormData, OwnProps>({
  form: 'ProjectResourcesFilter',
  onChange: syncFiltersToURL,
  initialValues: getInitialValues(),
})(PureProjectResourcesFilter);
