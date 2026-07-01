// שירות הודעות פשוט
//  ובהמשך אפשר להחליף אותו להודעות מעוצבות יותר

class NotifyService {
  success(message) {
    alert(`Success: ${message}`)
  }

  error(message) {
    alert(`Error: ${message}`)
  }

  info(message) {
    alert(`Info: ${message}`)
  }
}

export default new NotifyService()