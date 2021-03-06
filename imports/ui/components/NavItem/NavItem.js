import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';

import { SafeAnchor } from 'react-bootstrap';
import createChainedFunction from 'react-bootstrap/lib/utils/createChainedFunction';

const propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  role: PropTypes.string,
  href: PropTypes.string,
  onClick: PropTypes.func,
  onSelect: PropTypes.func,
  eventKey: PropTypes.any
};

const defaultProps = {
  active: false,
  disabled: false
};

class NavItem extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    if (this.props.onSelect) {
      e.preventDefault();

      if (!this.props.disabled) {
        this.props.onSelect(this.props.eventKey, e);
      }
    }
  }

  render() {
    const {
      active, disabled, onClick, className, anchorClassName, style, ...props
    } =
      this.props;

    delete props.onSelect;
    delete props.eventKey;

    // These are injected down by `<Nav>` for building `<SubNav>`s.
    delete props.activeKey;
    delete props.activeHref;

    if (!props.role) {
      if (props.href === '#') {
        props.role = 'button';
      }
    } else if (props.role === 'tab') {
      props['aria-selected'] = active;
    }
    return (
      <li
        role="presentation"
        data-toggle="collapse"
        data-target=".navbar-collapse.show"
        className={classNames(className, { active, disabled })}
        style={style}
      >
        <SafeAnchor
          {...props}
          disabled={disabled}
          className={anchorClassName}
          onClick={createChainedFunction(onClick, this.handleClick)}
        />
      </li>
    );
  }
}

NavItem.propTypes = propTypes;
NavItem.defaultProps = defaultProps;

export default NavItem;
