import { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { getNativeNameVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import {
  formatRegistrationMethod,
  formatUserStatus,
} from '@waldur/user/support/utils';
import { UserDetails } from '@waldur/workspace/types';

import { Row } from './Row';
import {
  userLanguageIsVisible,
  userCompetenceIsVisible,
  isVisibleForSupportOrStaff,
} from './selectors';

interface StateProps {
  userLanguageIsVisible: boolean;
  userCompetenceIsVisible: boolean;
  isVisibleForSupportOrStaff: boolean;
  nativeNameVisible: boolean;
}

interface OwnProps {
  user: UserDetails;
  profile?: any;
}

export type UserDetailsTableProps = TranslateProps & StateProps & OwnProps;

const PureUserDetailsTable: FunctionComponent<UserDetailsTableProps> = (
  props,
) => (
  <Table responsive={true} bordered={true}>
    <tbody>
      <Row label={props.translate('Full name')} value={props.user.full_name} />
      {props.nativeNameVisible && (
        <Row
          label={props.translate('Native name')}
          value={props.user.native_name}
        />
      )}
      <Row label={props.translate('ID code')} value={props.user.civil_number} />
      <Row
        label={props.translate('Phone numbers')}
        value={props.user.phone_number}
      />
      <Row label={props.translate('Email')} value={props.user.email} />
      <Row
        label={props.translate('Preferred language')}
        value={props.user.preferred_language}
        isVisible={props.userLanguageIsVisible}
      />
      <Row
        label={props.translate('Competence')}
        value={props.user.competence}
        isVisible={props.userCompetenceIsVisible}
      />
      <Row
        label={props.translate('Registration method')}
        value={formatRegistrationMethod(props.user)}
      />
      <Row
        label={props.translate('Date joined')}
        value={formatDateTime(props.user.date_joined)}
      />
      <Row
        label={props.translate('Organization')}
        value={props.user.organization}
      />
      <Row
        label={props.translate('Job position')}
        value={props.user.job_title}
      />
      {Array.isArray(props.user.affiliations) &&
      props.user.affiliations.length > 0 ? (
        <Row
          label={props.translate('Affiliations')}
          value={props.user.affiliations.join(', ')}
        />
      ) : null}
      <Row
        label={props.translate('Status')}
        value={formatUserStatus(props.user)}
        isVisible={props.isVisibleForSupportOrStaff}
      />
      <Row
        label={props.translate('FreeIPA')}
        value={props.profile?.username}
        isVisible={props.profile?.is_active}
      />
    </tbody>
  </Table>
);

const mapStateToProps = (state: RootState) => ({
  userLanguageIsVisible: userLanguageIsVisible(state),
  userCompetenceIsVisible: userCompetenceIsVisible(state),
  isVisibleForSupportOrStaff: isVisibleForSupportOrStaff(state),
  nativeNameVisible: getNativeNameVisible(state),
});

const enhance = compose(
  connect<StateProps, {}, OwnProps>(mapStateToProps),
  withTranslation,
);

export const UserDetailsTable = enhance(PureUserDetailsTable);
