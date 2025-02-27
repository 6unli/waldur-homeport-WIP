import { withTranslation } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import {
  Field,
  ResourceSummaryProps,
  PureResourceSummaryBase,
} from '@waldur/resource/summary';

const formatTenant = (props) => (
  <ResourceLink
    type="OpenStack.Tenant"
    uuid={props.tenant_uuid}
    project={props.project_uuid}
    label={props.tenant_name}
  />
);

const PureOpenStackServerGroupSummary = (props: ResourceSummaryProps) => {
  const { translate } = props;
  return (
    <span>
      <PureResourceSummaryBase {...props} />
      <Field label={translate('Tenant')} value={formatTenant(props.resource)} />
    </span>
  );
};

export const OpenStackServerGroupSummary = withTranslation(
  PureOpenStackServerGroupSummary,
);
