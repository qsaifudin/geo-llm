import './Message.css';

function Message({ type, content }) {
  return (
    <div className={`message ${type}-message`}>
      {content}
    </div>
  );
}

export default Message;