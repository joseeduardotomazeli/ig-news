import { ReactElement, cloneElement } from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';

interface ActiveLinkProps extends LinkProps {
  activeClassName: string;
  children: ReactElement;
}

function ActiveLink(props: ActiveLinkProps) {
  const { asPath } = useRouter();

  const { activeClassName, children, ...restProps } = props;

  const className = asPath === restProps.href ? activeClassName : '';

  return <Link {...restProps}>{cloneElement(children, { className })}</Link>;
}

export default ActiveLink;
